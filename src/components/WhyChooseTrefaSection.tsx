import React from 'react';
import { ShieldCheckIcon, TrendingUpIcon, CheckCircleIcon, HeartIcon, StarIcon, AwardIcon, UsersIcon, ClockIcon } from './icons';

const Feature: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

const WhyChooseTrefaSection: React.FC = () => {
  const features = [
    { icon: ShieldCheckIcon, title: "Seminuevos garantizados", description: "Cada auto pasa por una rigurosa inspección de 150 puntos para garantizar su calidad y tu tranquilidad." },
    { icon: TrendingUpIcon, title: "Financiamiento ágil", description: "Trabajamos con los mejores bancos para ofrecerte perfilación personalizada y aumentar tus probabilidades de aprobar tu solicitud." },
    { icon: CheckCircleIcon, title: "Proceso 100% Digital", description: "Completa todo el proceso desde la comodidad de tu casa, y recibe una respuesta en 24 horas o menos. Sin filas ni papeleos interminables." },
    { icon: HeartIcon, title: "Tranquilidad absoluta", description: "En TREFA no solicitamos pagos por adelantado. Paga tu enganche en sucursal después de conocer y manejar tu nuevo auto" },
  ];

  const stats = [
    { icon: StarIcon, value: '5 estrellas', label: 'Calificación promedio' },
    { icon: UsersIcon, value: '5,000+', label: 'Clientes satisfechos' },
    { icon: ClockIcon, value: '24h o menos', label: 'Respuesta de crédito' },
    { icon: AwardIcon, value: '100% en línea', label: 'Portal de financiamiento' },
  ];

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-white pt-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-snug lg:leading-tight">¿Por qué elegir TREFA?</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">Simplificamos cada paso para que tu experiencia sea segura, transparente y excepcional.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <stat.icon className="w-10 h-10 text-primary-500 mx-auto" />
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseTrefaSection;
