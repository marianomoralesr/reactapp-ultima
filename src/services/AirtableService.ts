import { config } from '../config';

interface LeadData {
    fullName: string;
    email: string;
    phone: string;
    income: string;
}

const { apiKey, baseId, tableId } = config.airtable.leadCapture;

const AIRTABLE_URL = `https://api.airtable.com/v0/${baseId}/${tableId}`;

class AirtableService {
    static async addLead(leadData: LeadData): Promise<void> {
        try {
            const fields: { [key: string]: string | number } = {
                'FullName': leadData.fullName,
                'Email': leadData.email,
                'Phone': leadData.phone,
            };

            // Only add MonthlyIncome if it's a non-empty string and a valid number
            if (leadData.income && leadData.income.trim() !== '') {
                const incomeNumber = parseFloat(leadData.income.replace(/[^0-9.-]+/g, ""));
                if (!isNaN(incomeNumber)) {
                    fields['MonthlyIncome'] = incomeNumber;
                }
            }

            const payload = {
                typecast: true,
                records: [{
                    fields: fields
                }]
            };

            const response = await fetch(AIRTABLE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Airtable API Error:', { status: response.status, body: errorData });

                let errorMessage = `Ocurrió un error al contactar a Airtable (Código: ${response.status}).`;
                const details = errorData?.error?.message || response.statusText;

                switch (response.status) {
                    case 401:
                        errorMessage = "Error de autenticación (401): La API Key de Airtable es inválida o ha expirado. Por favor, verifica que la clave 'pat...' sea correcta y esté activa.";
                        break;
                    case 403:
                        errorMessage = `Error de permisos (403): La API Key no tiene los permisos necesarios. Asegúrate de que tenga el scope 'data.records:write' y acceso a la base '${baseId}'.`;
                        break;
                    case 404:
                        errorMessage = `No se encontró el recurso (404): La Base ID '${baseId}' o la Table ID '${tableId}' son incorrectas. Por favor, verifícalas.`;
                        break;
                    case 422:
                        errorMessage = `Error de validación (422): Los datos enviados no son válidos para la tabla de Airtable. Revisa que los nombres de las columnas ('FullName', 'Email', 'Phone', 'MonthlyIncome') coincidan. Detalles: ${details}`;
                        break;
                    default:
                        errorMessage = `Error al registrar el lead en Airtable. Código: ${response.status}. Detalles: ${details}`;
                }

                throw new Error(errorMessage);
            }

            console.log('Lead submitted to Airtable successfully.');

        } catch (error) {
            console.error('Failed to add lead to Airtable:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Ocurrió un error inesperado al intentar guardar el lead.');
        }
    }
}

export default AirtableService;
