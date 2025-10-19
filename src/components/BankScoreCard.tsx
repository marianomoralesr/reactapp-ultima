import React from 'react';

interface BankScoreCardProps {
    bank: {
        name: string;
        logo: string;
        color: string;
        score: number;
    }
}

const BankScoreCard: React.FC<BankScoreCardProps> = ({ bank }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${bank.color} flex items-center justify-center text-white font-bold`}>
                    {bank.logo}
                </div>
                <div className="ml-3">
                    <p className="font-semibold">{bank.name}</p>
                    <p className="text-sm text-gray-500">Probabilidad: {bank.score}%</p>
                </div>
            </div>
        </div>
    );
};

export default BankScoreCard;