import React from 'react';
import useSEO from '../hooks/useSEO';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Award, Car, DollarSign, FileText, Wrench, Check, X, ArrowRight } from 'lucide-react';
import { proxyImage } from '../utils/proxyImage';

const benefitsData = [
    {
        icon: Award,
        title: '1. Compromiso de Calidad TREFA',
        description: 'Nuestro compromiso con la calidad es total, y lo demostramos con hechos. Confiamos tanto en nuestro riguroso proceso de inspección de 150 puntos que si tu auto presenta una falla mecánica en los primeros 30 días o 500 km (lo que ocurra primero), te devolvemos el 100% de tu dinero o lo reparamos sin costo.',
        value: 'Tranquilidad Absoluta.',
        details: []
    },
    {
        icon: FileText,
        title: '2. Certificado de Procedencia Segura',
        description: 'Garantizamos el pasado de tu auto para que tú te enfoques en su futuro. Este certificado es la prueba irrefutable de que el vehículo pasó nuestra rigurosa investigación legal y administrativa, que incluye:',
        value: '$3,500 MXN',
        details: [
            'Validación en REPUVE, SAT, Totalcheck y TransUnion.',
            'Inspección física forense de números de serie en chasis y motor.',
            'Auditoría documental de facturas y refrendos.',
            'Liquidación de cualquier adeudo en el Instituto de Control Vehicular.'
        ]
    },
    {
        icon: ShieldCheck,
        title: '3. Garantía Blindada con Cobertura de $100,000',
        description: 'Te protegemos contra las reparaciones más catastróficas. Tu auto está cubierto en motor y transmisión con una bolsa de protección de hasta $100,000 pesos durante un año completo. Conduce con la certeza de que estás blindado incluso contra el peor escenario.',
        value: 'Protección de $100,000 MXN',
        details: []
    },
    {
        icon: TrendingUp,
        title: '4. Programa de Recompra Garantizada TREFA',
        description: 'A través de este programa oficial, eliminamos la incertidumbre financiera. Te garantizamos por escrito la recompra de tu vehículo por el 80% de su valor el primer año y el 70% el segundo. Este beneficio aplica para vehículos con un uso de hasta 20,000 km por año, conservados en condiciones de uso normales y que cumplan con las políticas de compra vigentes de TREFA al momento de la transacción.',
        value: 'Protección Invaluable.',
        details: []
    },
    {
        icon: Wrench,
        title: '5. "Check-up de Confianza TREFA"',
        description: 'A los 6 meses o 10,000 km, te incluimos una inspección multipunto de seguridad sin costo. Nuestro equipo de expertos revisará los puntos vitales de tu vehículo (frenos, suspensión, niveles, neumáticos y componentes de seguridad) para asegurar que sigue funcionando en perfectas condiciones y prevenir problemas futuros.',
        value: '$4,000 MXN',
        details: []
    },
    {
        icon: Car,
        title: '6. Bono de Movilidad Garantizada',
        description: 'Tu vida no se detiene. Si tu auto ingresa a nuestro taller por garantía, te damos $250 pesos diarios para tus traslados, asegurando que tu rutina continúe sin interrupciones.',
        value: '$7,500 MXN',
        details: []
    },
    {
        icon: DollarSign,
        title: '7. Bono de Tranquilidad Financiera',
        description: 'Si tu auto está financiado, no tienes por qué pagar por él mientras está en nuestro taller por garantía. Nosotros cubrimos el equivalente a tu mensualidad promedio para aliviar esa carga.',
        value: '$8,500 MXN',
        details: []
    }
];

const comparisonData = [
    { feature: 'Compromiso de Calidad (30 días)', trefa: true, agencia: false, particular: false },
    { feature: 'Certificado de Procedencia Segura', trefa: true, agencia: 'parcial', particular: false },
    { feature: 'Garantía Blindada en Motor y Transmisión', trefa: true, agencia: 'limitada', particular: false },
    { feature: 'Recompra Garantizada por Contrato', trefa: true, agencia: false, particular: false },
    { feature: 'Check-up de Confianza a los 6 meses', trefa: true, agencia: false, particular: false },
    { feature: 'Apoyo para Movilidad durante Garantía', trefa: true, agencia: false, particular: false },
    { feature: 'Apoyo en Mensualidad durante Garantía', trefa: true, agencia: false, particular: false },
    { feature: 'Riesgo de Fraude o Vicios Ocultos', trefa: 'nulo', agencia: 'bajo', particular: 'alto' },
];

const Checkmark: React.FC<{ status: boolean | string }> = ({ status }) => {
    if (status === true) return <Check className="w-6 h-6 text-green-500 mx-auto" />;
    if (status === false) return <X className="w-6 h-6 text-red-500 mx-auto" />;
    if (status === 'parcial') return <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-1 rounded-full">Parcial</span>;
    if (status === 'limitada') return <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-1 rounded-full">Limitada</span>;
    if (status === 'nulo') return <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-1 rounded-full">NULO</span>;
    if (status === 'bajo') return <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-1 rounded-full">Bajo</span>;
    if (status === 'alto') return <span className="text-xs font-bold text-red-800 bg-red-100 px-2 py-1 rounded-full">ALTO</span>;
    return null;
};


const KitTrefaPage: React.FC = () => {
    useSEO({
        title: 'El Kit de Seguridad TREFA | Tu Compra Blindada',
        description: 'Cada auto TREFA incluye el Kit de Seguridad sin costo: Garantía de Satisfacción, Certificado de Procedencia, Garantía Blindada de $100,000 y mucho más.',
        keywords: 'kit de seguridad trefa, compra blindada, garantía de satisfacción, certificado de procedencia, garantía blindada, escudo anti-depreciación'
    });

    const tableData = [
        { label: "Certificado de Procedencia Segura", value: "$3,500" },
        { label: "Check-up de Confianza TREFA", value: "$4,000" },
        { label: "Bono de Movilidad Garantizada", value: "$7,500" },
        { label: "Bono de Tranquilidad Financiera", value: "$8,500" },
        { label: "Garantía Blindada con Cobertura", value: "$100,000" }
    ];
    
    const totalValue = "$123,500 MXN";

    return (
        <div className="bg-white text-gray-800 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 opacity-40">
                <div className="w-[800px] h-[800px] rounded-full bg-primary-500/5 blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-40">
                <div className="w-[600px] h-[600px] rounded-full bg-trefa-blue/5 blur-3xl"></div>
            </div>
            
            {/* Hero Section */}
            <header className="relative py-20 text-center px-4">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-4xl sm:text-6xl font-extrabold tracking-tight"
                >
                    El Kit de{' '}
                    <span className="bg-gradient-to-r from-yellow-400 via-primary-500 to-orange-600 bg-clip-text text-transparent">
                        Seguridad
                    </span>
                    {' '}TREFA
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="mt-6 text-lg max-w-3xl mx-auto text-gray-600"
                >
                    Incluido en <strong className="text-gray-900">CADA</strong> auto que vendemos, sin costo adicional. No es una promoción, es nuestra promesa estándar para garantizar tu total tranquilidad.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                    className="mt-10"
                >
                    <Link to="/autos" className="inline-block bg-primary-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105">
                        Ver Inventario Certificado
                    </Link>
                </motion.div>
            </header>
            
            {/* Comparison Section */}
            <section className="relative py-20 px-4 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-4">La Diferencia TREFA es Abismal</h2>
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">Compara los beneficios que obtienes con nosotros frente a las alternativas tradicionales. Tu tranquilidad no es negociable.</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
                    <table className="w-full text-sm sm:text-base">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th className="p-4 text-lg font-semibold text-left">Beneficio / Riesgo</th>
                                <th className="p-4 text-lg font-semibold text-center">TREFA</th>
                                <th className="p-4 text-lg font-semibold text-center">Otra Agencia</th>
                                <th className="p-4 text-lg font-semibold text-center">Vendedor Particular</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {comparisonData.map((item) => (
                                <tr key={item.feature} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{item.feature}</td>
                                    <td className="p-4 text-center"><Checkmark status={item.trefa} /></td>
                                    <td className="p-4 text-center"><Checkmark status={item.agencia} /></td>
                                    <td className="p-4 text-center"><Checkmark status={item.particular} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Benefits Details Section */}
            <section className="relative py-20 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Cada Beneficio, Explicado</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefitsData.map((benefit, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md border flex flex-col">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                                    <benefit.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mt-4">{benefit.title}</h3>
                                <p className="mt-3 text-gray-700 leading-relaxed flex-grow">{benefit.description}</p>
                                <p className="mt-4 text-base font-semibold text-gray-500">
                                    • Valor: <span className="text-gray-800">{benefit.value}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Summary Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold">Un Valor que Puedes Medir</h2>
                        <p className="mt-4 text-gray-600">El Kit de Seguridad TREFA no es solo una promesa, es un paquete de beneficios tangibles que suman un valor real a tu compra, dándote una protección que no encontrarás en ningún otro lugar.</p>
                         <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-4 text-sm font-semibold uppercase text-gray-600">Beneficio</th>
                                        <th className="p-4 text-sm font-semibold uppercase text-gray-600 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row, index) => (
                                        <tr key={index} className="border-t border-gray-200">
                                            <td className="p-4 text-gray-800">{row.label}</td>
                                            <td className="p-4 text-gray-800 font-medium text-right">{row.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-primary-50 border-t-2 border-primary-200">
                                        <td className="p-4 font-bold text-primary-700 uppercase">VALOR TOTAL:</td>
                                        <td className="p-4 font-extrabold text-primary-700 text-right text-lg">{totalValue}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    <div className="text-center">
                        <img src={proxyImage("http://5.183.8.48/wp-content/uploads/2025/09/Artboard-4-copy.png")} alt="Garantía Blindada" className="max-w-sm mx-auto"/>
                    </div>
                </div>
            </section>
            
            {/* Final CTA Section */}
            <section className="relative py-20 text-center bg-gray-100 px-4">
                <h2 className="text-3xl font-bold text-gray-900">Tu Próximo Auto te Espera con Todo Incluido</h2>
                <p className="mt-4 max-w-2xl mx-auto text-gray-600">No dejes tu inversión al azar. Elige la certeza y la tranquilidad que solo TREFA te puede ofrecer.</p>
                <div className="mt-8">
                    <Link to="/autos" className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105">
                        Explorar Autos con Kit de Seguridad
                        <ArrowRight className="w-5 h-5"/>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default KitTrefaPage;