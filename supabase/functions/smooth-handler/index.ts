// supabase/functions/inventario-cache-api/index.ts
// Exposes public.inventario_cache via HTTP with filters & pagination.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// DB client with service role to bypass RLS for read-only exposure inside this function.
const admin = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false
  }
});
const parseBool = (v)=>v === undefined ? undefined : v.toLowerCase() === "true";
const toInt = (v, d)=>{
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : d; // cap page_size to 500
};
const json = (data, status = 200)=>new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Connection": "keep-alive"
    }
  });
const notFound = ()=>json({
    error: "Not found"
  }, 404);
const badRequest = (msg)=>json({
    error: msg
  }, 400);
const serverError = (msg)=>json({
    error: msg
  }, 500);
console.info("inventario-cache-api started");
Deno.serve(async (req)=>{
  try {
    const url = new URL(req.url);
    const pathname = url.pathname; // e.g. /inventario-cache-api/inventario-cache
    // Edge functions are routed with prefix /<function-name>
    const base = `/${Deno.env.get("FUNC_NAME") ?? "inventario-api"}`;
    const subpath = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
    // Routing
    // GET /inventario-cache
    if (req.method === "GET" && subpath === "/inventario") {
      const params = Object.fromEntries(url.searchParams.entries());
      return handleList(params);
    }
    // GET /inventario/:record_id
    const match = subpath.match(/^\/inventario\/([^/]+)$/);
    if (req.method === "GET" && match) {
      const recordId = decodeURIComponent(match[1]);
      return handleGet(recordId);
    }
    return notFound();
  } catch (e) {
    console.error("Unhandled error:", e);
    return serverError("Internal error");
  }
});
// Handlers
async function handleList(q) {
  const page = toInt(String(q.page ?? ""), 1);
  const pageSize = toInt(String(q.page_size ?? ""), 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = admin.from("inventario").select("*", {
    count: "exact"
  }).order("cached_at", {
    ascending: false,
    nullsFirst: true
  }).range(from, to);
  // Filters
  if (q.ordencompra) query = query.eq("ordencompra", q.ordencompra);
  if (q.marca) query = query.ilike("marca", `%${q.marca}%`);
  if (q.modelo) query = query.ilike("modelo", `%${q.modelo}%`);
  if (q.vendido !== undefined) {
    const v = parseBool(q.vendido);
    if (v !== undefined) query = query.eq("vendido", v);
  }
  if (q.separado !== undefined) {
    const v = parseBool(q.separado);
    if (v !== undefined) query = query.eq("separado", v);
  }
  // Price range: precio or autoprecio can exist; prefer precio if present
  if (q.min_price) query = query.gte("precio", q.min_price);
  if (q.max_price) query = query.lte("precio", q.max_price);
  // Free-text search over common fields
  if (q.search) {
    // Broad ilike filters; consider adding a tsvector index for performance
    const s = `%${q.search}%`;
    query = query.or([
      `titulo.ilike.${s}`,
      `title.ilike.${s}`,
      `marca.ilike.${s}`,
      `modelo.ilike.${s}`,
      `descripcion.ilike.${s}`,
      `description.ilike.${s}`,
      `slug.ilike.${s}`,
      `ordencompra.ilike.${s}`
    ].join(","));
  }
  const { data, error, count } = await query;
  if (error) {
    console.error("Query error:", error);
    return serverError(error.message);
  }
  return json({
    page,
    page_size: pageSize,
    total: count ?? 0,
    items: data ?? []
  });
}
async function handleGet(recordId) {
  const { data, error } = await admin.from("inventario").select("*").eq("record_id", recordId).limit(1).maybeSingle();
  if (error) {
    console.error("Fetch error:", error);
    return serverError(error.message);
  }
  if (!data) return notFound();
  return json(data);
}
