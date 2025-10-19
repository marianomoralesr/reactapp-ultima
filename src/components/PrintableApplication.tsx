import React from 'react';

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-sm font-bold uppercase tracking-wider text-white bg-trefa-blue p-2 rounded-t-md mt-4">{title}</h3>
);

const DataRow: React.FC<{ label: string, value: any }> = ({ label, value }) => (
    <div className="flex justify-between py-2 px-3 border-b border-x border-gray-200">
        <p className="text-sm text-gray-600">{label}:</p>
        <p className="text-sm font-semibold text-gray-800 text-right">{value || 'N/A'}</p>
    </div>
);

const PrintableApplication: React.FC<{ application: any }> = ({ application }) => {
    const profile = application.personal_info_snapshot || {};
    const appData = application.application_data || {};
    const carInfo = application.car_info || {};

    return (
        <div className="p-4 sm:p-8 bg-white printable-offer">
            <header className="flex justify-between items-start pb-4 border-b-2 border-primary-500">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Solicitud de Financiamiento</h1>
                    <p className="text-sm text-gray-500 font-mono">ID de Aplicación: {application.id}</p>
                    <p className="text-sm text-gray-500">Fecha de envío: {new Date(application.created_at).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
                </div>
                <img src="/images/trefalogo.png" alt="TREFA Logo" className="h-12" />
            </header>

            <main className="mt-6">
                {/* Vehicle Information */}
                <SectionHeader title="Vehículo de Interés" />
                <div className="rounded-b-md overflow-hidden">
                    <DataRow label="Auto" value={carInfo._vehicleTitle} />
                    <DataRow label="Orden de Compra" value={carInfo._ordenCompra} />
                </div>
                
                {/* Personal Information */}
                <SectionHeader title="Datos del Solicitante" />
                <div className="grid grid-cols-1 md:grid-cols-2 rounded-b-md overflow-hidden">
                    <DataRow label="Nombre Completo" value={`${profile.first_name} ${profile.last_name} ${profile.mother_last_name}`} />
                    <DataRow label="Email" value={profile.email} />
                    <DataRow label="Teléfono" value={profile.phone} />
                    <DataRow label="RFC" value={profile.rfc} />
                    <DataRow label="Fecha de Nacimiento" value={profile.birth_date} />
                    <DataRow label="Estado Civil" value={profile.civil_status} />
                    <DataRow label="Dirección" value={`${appData.current_address}, ${appData.current_city}, ${appData.current_state} ${appData.current_zip_code}`} />
                    <DataRow label="Tipo de Vivienda" value={appData.housing_type} />
                </div>

                {/* Employment Information */}
                <SectionHeader title="Información Laboral" />
                 <div className="grid grid-cols-1 md:grid-cols-2 rounded-b-md overflow-hidden">
                    <DataRow label="Clasificación Fiscal" value={appData.fiscal_classification} />
                    <DataRow label="Empresa" value={appData.company_name} />
                    <DataRow label="Puesto" value={appData.job_title} />
                    <DataRow label="Antigüedad" value={appData.job_seniority} />
                    <DataRow label="Ingreso Mensual Neto" value={appData.net_monthly_income} />
                    <DataRow label="Teléfono (Empresa)" value={appData.company_phone} />
                </div>

                 {/* References */}
                <SectionHeader title="Referencias" />
                 <div className="grid grid-cols-1 md:grid-cols-2 rounded-b-md overflow-hidden">
                    <DataRow label="Referencia Familiar" value={appData.family_reference_name} />
                    <DataRow label="Teléfono (Familiar)" value={appData.family_reference_phone} />
                    <DataRow label="Referencia Amistad" value={appData.friend_reference_name} />
                    <DataRow label="Teléfono (Amistad)" value={appData.friend_reference_phone} />
                </div>
            </main>

            <footer className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
                <p className="font-bold text-gray-600">Este documento es una copia de la solicitud enviada y no constituye un contrato ni un documento oficial. La aprobación está sujeta a la validación de la institución financiera.</p>
                <br />
                TREFA AUTOS | {new Date().getFullYear()}
            </footer>
        </div>
    );
};

export default PrintableApplication;