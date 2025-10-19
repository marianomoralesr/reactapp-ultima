import React from 'react';
import PortalCta from './PortalCta';
import RegisterBenefits from './RegisterBenefits';

const AuthBenefitsBlock: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
            <PortalCta />
            <RegisterBenefits />
        </div>
    );
};

export default AuthBenefitsBlock;