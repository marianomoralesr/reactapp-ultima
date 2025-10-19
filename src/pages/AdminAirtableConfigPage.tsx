import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { config } from '../config';

const InputField: React.FC<any> = ({ id, label, register, placeholder, type = "text", isSecret = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            id={id} 
            {...register(id)} 
            type={type} 
            className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 font-mono text-sm" 
            placeholder={placeholder}
        />
        {isSecret && <p className="text-xs text-gray-500 mt-1">Este valor es sensible y no se mostrará después de guardarlo.</p>}
    </div>
);

const ConfigCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

const AdminAirtableConfigPage: React.FC = () => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({
        defaultValues: {
            valuationApiKey: '',
            valuationBaseId: config.airtable.valuation.baseId,
            valuationTableId: config.airtable.valuation.tableId,
            leadCaptureApiKey: '',
            leadCaptureBaseId: config.airtable.leadCapture.baseId,
            leadCaptureTableId: config.airtable.leadCapture.tableId,
        }
    });
    
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    const onSubmit = async (data: any) => {
        // In a real app, this would save to a secure backend or environment variables.
        // Here, we just log it and show a success message.
        console.log("Saving Airtable Configuration:", data);
        await new Promise(r => setTimeout(r, 1000));
        alert("Configuración guardada (simulado). En una aplicación real, esto se guardaría de forma segura en el backend.");
    };

    const handleTestConnection = async () => {
        setTestStatus('testing');
        setTestMessage('');
        await new Promise(r => setTimeout(r, 1500)); // Simulate API call
        // Mock success/error randomly
        if (Math.random() > 0.3) {
            setTestStatus('success');
            setTestMessage('¡Conexión exitosa con la API de Airtable!');
        } else {
            setTestStatus('error');
            setTestMessage('Falló la conexión. Verifica tu API Key y Base ID.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Database className="w-8 h-8 mr-3 text-primary-600" />
                    Configuración de Airtable
                </h1>
                <p className="mt-2 text-gray-600">
                    Gestiona las credenciales y IDs para conectar la aplicación con tus bases de Airtable.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <ConfigCard title="Base de Valuación de Vehículos">
                    <InputField id="valuationApiKey" label="API Key (Personal Access Token)" register={register} placeholder="pat..." type="password" isSecret />
                    <InputField id="valuationBaseId" label="Base ID" register={register} placeholder="app..." />
                    <InputField id="valuationTableId" label="Table ID (Vehículos)" register={register} placeholder="tbl..." />
                </ConfigCard>

                <ConfigCard title="Base de Captura de Leads">
                    <InputField id="leadCaptureApiKey" label="API Key (Personal Access Token)" register={register} placeholder="pat..." type="password" isSecret />
                    <InputField id="leadCaptureBaseId" label="Base ID" register={register} placeholder="app..." />
                    <InputField id="leadCaptureTableId" label="Table ID (Leads)" register={register} placeholder="tbl..." />
                </ConfigCard>
                
                <div>
                    <button type="button" onClick={handleTestConnection} disabled={testStatus === 'testing'} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                        {testStatus === 'testing' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Probar Conexión'}
                    </button>
                    {testStatus !== 'idle' && (
                        <div className={`mt-4 p-3 rounded-md flex items-center text-sm ${testStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {testStatus === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                            {testMessage}
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400">
                        {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAirtableConfigPage;
