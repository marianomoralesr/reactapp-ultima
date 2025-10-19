import React from 'react';
import { ChevronDown } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { proxyImage } from '../utils/proxyImage';

const faqData = [
    {
        category: 'Preguntas Generales',
        questions: [
            {
                q: '¿Dónde están ubicados?',
                a: 'Nuestra sucursal principal está en Aarón Sáenz Garza 1902, Plaza Oasis, Local 1109, Col. Santa María, Monterrey, NL, CP 64650, México. ¡Te esperamos!'
            },
            {
                q: '¿Ofrecen pruebas de manejo?',
                a: '¡Claro! Puedes agendar una prueba de manejo para cualquier auto de nuestro inventario. Contáctanos por WhatsApp o directamente desde la página del auto para coordinar una cita.'
            },
            {
                q: 'El auto que me interesa está en otra sucursal, ¿pueden traerlo?',
                a: 'Sí, podemos coordinar el traslado de autos entre nuestras sucursales. Consulta con tu asesor de ventas para conocer los detalles y posibles costos asociados.'
            },
            {
                q: '¿Puedo separar un auto en línea?',
                a: 'Sí, puedes separar el auto que te interesa con un pequeño depósito para asegurarte de que nadie más lo compre mientras completas tu proceso de financiamiento o pago.'
            },
            {
                q: '¿Puedo realizar pagos en línea?',
                a: 'Sí, ofrecemos un portal de pagos seguro para que puedas realizar el apartado o el pago de tu auto de forma cómoda y segura.'
            }
        ]
    },
    {
        category: 'Compras al Contado',
        questions: [
            {
                q: 'Si realizo el pago al contado, ¿cuánto tiempo tomará la entrega del auto?',
                a: 'Una vez confirmado el pago total, la entrega del auto se realiza generalmente en un plazo de 24 a 48 horas hábiles, una vez completado todo el papeleo.'
            },
            {
                q: '¿Ustedes se encargan del cambio de propietario?',
                a: 'Sí, como parte de nuestro servicio integral, nos encargamos de realizar el trámite de cambio de propietario para que no tengas que preocuparte por nada.'
            },
            {
                q: '¿El apartado es reembolsable?',
                a: 'El apartado es 100% reembolsable en caso de que tu solicitud de financiamiento no sea aprobada. Si decides no continuar con la compra por otras razones, se aplican ciertas condiciones. Consulta los términos con tu asesor.'
            },
            {
                q: '¿Cuánto tiempo dura mi apartado?',
                a: 'Tu apartado asegura el auto por un periodo de 3 a 5 días hábiles, dándote tiempo suficiente para finalizar el proceso de compra.'
            },
            {
                q: '¿Qué documentos recibiré al comprar un auto al contado?',
                a: 'Recibirás la factura original del auto a tu nombre, el comprobante de pago, la póliza de garantía y todos los documentos de propiedad del auto (tenencias, verificación, etc.).'
            },
            {
                q: '¿Cuál es el monto máximo permitido para pago en efectivo?',
                a: 'De acuerdo con la Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita, el monto máximo para pagos en efectivo es limitado. Preferimos y recomendamos realizar pagos vía transferencia electrónica (SPEI) para mayor seguridad.'
            }
        ]
    },
    {
        category: 'Vender tu Auto',
        questions: [
            {
                q: '¿Cuánto tiempo tardan en pagar los autos que compro-vendo?',
                a: 'El pago se realiza de forma inmediata vía transferencia SPEI una vez que se firma el contrato de compra-venta y se entregan todos los documentos requeridos.'
            },
            {
                q: '¿Cuáles son los requisitos para vender mi auto?',
                a: 'Necesitarás la factura original, comprobantes de pago de tenencia de los últimos 5 años, tarjeta de circulación vigente, identificación oficial y que el auto no tenga adeudos ni reportes legales.'
            },
            {
                q: '¿Puedo vender mi auto si aún está financiado?',
                a: 'Sí. Nosotros liquidamos el adeudo directamente con la financiera y te pagamos la diferencia a tu favor. Solo necesitarás una carta saldo emitida por tu banco.'
            },
            {
                q: '¿En qué consiste la inspección del auto?',
                a: 'Realizamos una inspección exhaustiva de 150 puntos que cubre aspectos mecánicos (motor, transmisión), estéticos (carrocería, interiores) y legales (verificación de series, historial de propiedad).'
            }
        ]
    },
    {
        category: 'Financiamiento',
        questions: [
            {
                q: '¿Cuáles son los requisitos para el financiamiento?',
                a: 'Para personas físicas, generalmente se requiere: identificación oficial (INE), comprobante de domicilio, comprobante de ingresos de los últimos 3 meses y un buen historial crediticio.'
            },
            {
                q: '¿Cuál es el monto mínimo de enganche?',
                a: 'El enganche mínimo suele ser del 15% del valor del auto, pero puede variar según tu perfil crediticio y el auto que elijas.'
            },
            {
                q: '¿Cuál es el plazo de financiamiento disponible?',
                a: 'Ofrecemos plazos flexibles que van desde los 12 hasta los 60 meses, e incluso 72 meses en algunos casos, para que elijas el que mejor se adapte a tu presupuesto.'
            },
            {
                q: '¿Qué bancos manejamos para el financiamiento?',
                a: 'Trabajamos con los principales bancos y financieras del país, como BBVA, Scotiabank, Banorte, Afirme, Banregio, entre otros, para ofrecerte las mejores condiciones.'
            }
        ]
    }
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => (
    <details className="group border-b border-gray-200 py-4">
        <summary className="flex justify-between items-center font-semibold text-gray-800 cursor-pointer list-none">
            <span>{q}</span>
            <span className="transition-transform duration-300 transform group-open:rotate-180">
                <ChevronDown className="w-5 h-5 text-primary-600" />
            </span>
        </summary>
        <p className="text-gray-600 mt-3 prose prose-sm max-w-none">{a}</p>
    </details>
);

const FaqPage: React.FC = () => {
    useSEO({
        title: 'Preguntas Frecuentes sobre Compra, Venta y Financiamiento | TREFA',
        description: 'Encuentra respuestas a tus dudas sobre cómo comprar, vender o financiar un auto seminuevo en TREFA. Aclaramos todo sobre garantías, requisitos y pruebas de manejo.',
        keywords: 'preguntas frecuentes trefa, dudas financiamiento auto, requisitos para comprar auto seminuevo, garantía autos usados, vender mi auto, prueba de manejo'
    });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl overflow-hidden mb-12 bg-neutral-800 text-white p-8 sm:p-12 text-center">
                <img src={proxyImage("https://autos.trefa.mx/wp-content/uploads/2024/09/fondo-preguntas-frecuentes-trefa.jpg")} alt="FAQ banner" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                <div className="relative">
                    <h1 className="text-3xl sm:text-4xl font-bold">Preguntas Frecuentes</h1>
                    <p className="mt-2 text-lg text-gray-300">Encuentra respuestas a las dudas más comunes sobre nuestros servicios.</p>
                </div>
            </div>
            <div className="space-y-10">
                {faqData.map(category => (
                    <div key={category.category}>
                        <h2 className="text-2xl font-semibold text-gray-900 pb-4 border-b-2 border-primary-500 mb-4">{category.category}</h2>
                        <div className="space-y-2">
                            {category.questions.map((item, index) => (
                                <FaqItem key={index} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FaqPage;