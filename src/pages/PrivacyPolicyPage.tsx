import React from 'react';
import useSEO from '../hooks/useSEO';

const PrivacyPolicyPage: React.FC = () => {
    useSEO({
        title: 'Política de Privacidad | TREFA',
        description: 'Conoce cómo TREFA protege y utiliza tus datos personales. Tu confianza y seguridad son nuestra prioridad.',
        keywords: 'política de privacidad, protección de datos, trefa, seguridad, datos personales'
    });

    return (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <article className="prose prose-lg lg:prose-xl max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-primary-600 hover:prose-a:text-primary-700">
                    <h1 className="text-center">Política de Privacidad de TREFA</h1>
                    <p className="lead text-center text-gray-500">Última actualización: 23 de Septiembre, 2025</p>

                    <p>En TREFA, tu confianza es lo más importante. Nos tomamos muy en serio la protección de tus datos personales y queremos que sepas con total transparencia cómo los utilizamos, siempre con el compromiso de resguardar tu privacidad y cumplir con las leyes aplicables en México y las regulaciones internacionales correspondientes.</p>

                    <h2>1. ¿Quiénes somos?</h2>
                    <p>TREFA es una agencia dedicada a la venta de autos seminuevos en Monterrey, Nuevo León. Nuestro sitio web y nuestras herramientas digitales están pensadas para ayudarte a encontrar el auto ideal y vivir una experiencia segura y confiable.</p>

                    <h2>2. ¿Qué información recolectamos?</h2>
                    <p>Cuando visitas nuestro sitio o interactúas con nosotros, podemos recopilar información como:</p>
                    <ul>
                        <li><strong>Datos de contacto</strong> que tú mismo nos proporciones (nombre, teléfono, correo electrónico).</li>
                        <li><strong>Información de tu navegación</strong> en nuestro sitio (qué páginas visitas, cuánto tiempo permaneces, qué contenido te interesa).</li>
                        <li><strong>Datos técnicos básicos</strong>, como tu dirección IP, el navegador que utilizas y el dispositivo desde el que nos visitas.</li>
                    </ul>
                    <p>No pedimos información financiera ni datos sensibles a través de nuestro sitio web público.</p>

                    <h2>3. ¿Para qué usamos tu información?</h2>
                    <p>Tu información se utiliza exclusivamente con fines de mercadotecnia, servicio y mejora continua, como:</p>
                    <ul>
                        <li>Conocer qué autos o servicios son de mayor interés para ti.</li>
                        <li>Personalizar la forma en que te mostramos promociones y contenido.</li>
                        <li>Optimizar nuestro sitio web para que sea más fácil y útil.</li>
                        <li>Comunicarnos contigo solo si nos autorizas, ya sea para enviarte información de interés o dar seguimiento a tus consultas.</li>
                    </ul>
                    <p>Nunca vendemos ni compartimos tu información con terceros para fines distintos a los aquí descritos.</p>

                    <h2>4. Uso de cookies y tecnologías similares</h2>
                    <p>Nuestro sitio utiliza cookies y herramientas de análisis para entender cómo interactúas con nosotros y mejorar tu experiencia. Estas cookies pueden:</p>
                    <ul>
                        <li>Guardar tus preferencias de navegación.</li>
                        <li>Ayudarnos a entender qué partes del sitio son más útiles.</li>
                        <li>Permitirnos mostrarte anuncios relevantes de acuerdo a tus intereses.</li>
                    </ul>
                    <p>Si lo prefieres, puedes configurar tu navegador para bloquear cookies o recibir una notificación antes de que se instalen.</p>

                    <h2>5. Microsoft Clarity y análisis de uso</h2>
                    <p>En TREFA trabajamos con Microsoft Clarity y Microsoft Advertising para comprender cómo usas nuestro sitio. Esto incluye:</p>
                    <ul>
                        <li><strong>Mapas de calor (heatmaps)</strong> que muestran qué secciones reciben más atención.</li>
                        <li><strong>Reproducciones de sesiones (session replay)</strong> que nos ayudan a ver de manera anónima cómo navegas en el sitio.</li>
                        <li>Datos sobre clics, desplazamientos y tiempo en cada página.</li>
                    </ul>
                    <p>Toda esta información se usa únicamente para:</p>
                    <ul>
                        <li>Mejorar la experiencia de navegación.</li>
                        <li>Detectar posibles problemas técnicos o de seguridad.</li>
                        <li>Ofrecerte publicidad más relevante.</li>
                    </ul>
                    <p>Al navegar en nuestro sitio aceptas este uso de información. Para conocer más sobre cómo Microsoft maneja tus datos, puedes visitar la <a href="https://privacy.microsoft.com/es-es/privacystatement" target="_blank" rel="noopener noreferrer">Declaración de Privacidad de Microsoft</a>.</p>

                    <h2>6. ¿Cómo protegemos tu información?</h2>
                    <ul>
                        <li>Usamos medidas de seguridad técnicas y organizativas para resguardar tus datos.</li>
                        <li>Limitamos el acceso solo a personal autorizado de TREFA.</li>
                        <li>No compartimos tus datos personales con terceros fuera de los fines mencionados.</li>
                        <li>Cumplimos con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares en México.</li>
                    </ul>

                    <h2>7. Tus derechos</h2>
                    <p>Tienes derecho a:</p>
                    <ul>
                        <li>Acceder a la información que tenemos sobre ti.</li>
                        <li>Solicitar que corrijamos o eliminemos tus datos.</li>
                        <li>Retirar tu consentimiento para que usemos tus datos en cualquier momento.</li>
                    </ul>
                    <p>Puedes ejercer estos derechos enviando un correo a: <a href="mailto:privacidad@trefa.com">privacidad@trefa.com</a>.</p>
                    
                    <h2>8. Actualizaciones de esta política</h2>
                    <p>TREFA puede actualizar esta Política de Privacidad de vez en cuando para reflejar cambios en la ley, en nuestros servicios o en nuestras herramientas digitales. Publicaremos siempre la versión más reciente en esta misma página.</p>
                </article>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
