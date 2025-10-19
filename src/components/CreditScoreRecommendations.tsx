import React from 'react';
import { TrendingUp } from 'lucide-react';

interface UserProfile {
    hasDebt: boolean;
    paymentHistory: 'good' | 'fair' | 'poor';
    creditUtilization: number;
}

type ApplicationStatus = 'draft' | 'submitted' | 'reviewing' | 'pending_docs' | 'approved' | 'rejected' | 'pending' | 'in_progress';

interface CreditScoreRecommendationsProps {
    currentScore: number;
    lastApplicationStatus: ApplicationStatus;
    userProfile: UserProfile;
}

const CreditScoreRecommendations: React.FC<CreditScoreRecommendationsProps> = ({ currentScore: _currentScore, userProfile }) => {
  const recommendations = [];
  if (userProfile.creditUtilization > 30) {
    recommendations.push("Reduce el uso de tus tarjetas de crédito por debajo del 30% de tu límite.");
  }
  if (userProfile.hasDebt) {
    recommendations.push("Considera consolidar tus deudas para mejorar tu puntaje.");
  }
  if (userProfile.paymentHistory !== 'good') {
    recommendations.push("Asegúrate de realizar todos tus pagos a tiempo.");
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
        Mejora tu Perfil
      </h3>
      {recommendations.length > 0 ? (
        <ul className="space-y-2 text-sm text-gray-700">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span> {rec}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600">¡Tu perfil crediticio se ve bien! Sigue así.</p>
      )}
    </div>
  );
};

export default CreditScoreRecommendations;