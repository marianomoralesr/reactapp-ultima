import { supabase } from '../../supabaseClient';
import type { ApplicationListItem, LatestApplicationData, UpdatedApplicationData } from '../types/types';

export const ApplicationService = {
  async submitApplication(applicationData: Record<string, any>): Promise<{ id: string } | null> {
    const { data, error } = await supabase.rpc('submit_application', { application_data: applicationData });

    if (error) {
      console.error('Error submitting application:', error.message);
      throw new Error('No se pudo enviar la solicitud.');
    }
    return data ? { id: data } : null;
  },

  async getUserApplications(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('financing_applications')
      .select('id, status, created_at, updated_at, car_info')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user applications:', error.message);
      throw new Error(`No se pudieron obtener las solicitudes: ${error.message}`);
    }
    return data ?? [];
  },

  async getApplicationById(userId: string, applicationId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('financing_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching application by ID:', error.message, { code: error.code, details: error.details });
      throw new Error('No se pudo obtener la solicitud.');
    }
    return data ?? null;
  },

  async getLatestApplicationForUser(userId: string): Promise<LatestApplicationData | null> {
    const { data, error } = await supabase
      .from('financing_applications')
      .select('id, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest application for user:', error.message, { code: error.code, details: error.details });
      return null;
    }
    return data ?? null;
  },

  async updateApplication(applicationId: string, applicationData: Record<string, any> & { documents_pending?: boolean }): Promise<UpdatedApplicationData | null> {
    if (applicationData.status === 'submitted') {
        const result = await this.submitApplication({ ...applicationData, id: applicationId });
        return result ? { ...result, status: 'submitted', updated_at: new Date().toISOString() } : null;
    }

    const newStatus = applicationData.documents_pending ? 'pending_docs' : 'submitted';
    const patch: Record<string, any> = { status: newStatus };
    for (const [k, v] of Object.entries(applicationData)) {
      if (v !== undefined && k !== 'documents_pending') patch[k] = v;
    }

    const { data, error } = await supabase
      .from('financing_applications')
      .update(patch)
      .eq('id', applicationId)
      .select('id, status, updated_at')
      .maybeSingle();

    if (error) {
      console.error('Error updating application:', error.message, { code: error.code, details: error.details });
      throw new Error('No se pudo enviar la solicitud.');
    }

    return data;
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    const { data: current, error: readErr } = await supabase
      .from('financing_applications')
      .select('status')
      .eq('id', applicationId)
      .maybeSingle();

    if (readErr) {
      console.error('Error reading current status:', readErr.message, { code: readErr.code, details: readErr.details });
      throw new Error('Could not read application status.');
    }
    if (!current || current.status === status) return;

    const { error } = await supabase
      .from('financing_applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) {
      console.error('Error updating application status:', error.message, { code: error.code, details: error.details });
      throw new Error('Could not update application status.');
    }
  },

  async hasActiveApplication(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('financing_applications')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['submitted', 'reviewing', 'pending_docs'])
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking for active applications:', error.message, { code: error.code, details: error.details });
      throw new Error('No se pudo verificar el estado de las solicitudes existentes.');
    }

    return data !== null;
  },

  async createDraftApplication(userId: string, initialData: Record<string, any> = {}): Promise<ApplicationListItem | null> {
    const { data: newDraft, error: createError } = await supabase
      .from('financing_applications')
      .insert({ user_id: userId, status: 'draft', ...initialData })
      .select('id, status, created_at, updated_at')
      .single();

    if (createError) {
      console.error('Error creating new draft application:', createError.message, { code: createError.code, details: createError.details });
      throw new Error('No se pudo iniciar una nueva solicitud.');
    }

    return newDraft;
  },

  async saveApplicationDraft(applicationId: string, draftData: Record<string, any>): Promise<UpdatedApplicationData | null> {
    const { data, error } = await supabase
      .from('financing_applications')
      .update(draftData)
      .eq('id', applicationId)
      .select('id, status, updated_at')
      .single();

    if (error) {
      console.error('Error saving application draft:', error.message, { code: error.code, details: error.details });
      throw new Error('No se pudo guardar el borrador de la solicitud.');
    }

    return data;
  },

  async deleteApplication(applicationId: string, userId: string) {
    const { data, error } = await supabase
      .from('financing_applications')
      .delete()
      .match({ id: applicationId, user_id: userId, status: 'draft' });

    if (error) {
      console.error('Error deleting application:', error.message, { code: error.code, details: error.details });
      throw new Error('No se pudo eliminar el borrador.');
    }
    return data;
  },
};
