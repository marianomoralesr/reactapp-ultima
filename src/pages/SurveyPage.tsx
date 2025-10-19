import React from 'react';

const SurveyPage: React.FC = () => {
    return (
        <div className="w-full h-screen p-0 m-0">
            <iframe
                src="https://trefa-buyer-persona-survey-analytics-898935312460.us-west1.run.app/#/survey"
                className="w-full h-full border-0"
                title="Encuesta de Perfil de Comprador"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default SurveyPage;
