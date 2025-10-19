import { config } from '../config';

const API_KEY = config.carStudio.apiKey;
const PROXY_URL = config.proxy.url;

const API_URLS = {
    GET: 'https://tokyo.carstudio.ai/home/carstudio/get',
    LIST: 'https://tokyo.carstudio.ai/home/carstudio/list',
    SEARCH: 'https://tokyo.carstudio.ai/home/api/v1/car-studio/search',
    UPLOAD_V2: 'https://tokyo.carstudio.ai/webEditor/uploadImagesWithUrlV2',
    WEB_EDITOR_LIST: 'https://tokyo.carstudio.ai/webEditor/list',
    GET_CREDIT: 'https://tokyo.carstudio.ai/home/carstudio/getCredit',
};

// Error codes provided by the user
const errorMap: { [key: string]: string } = {
    '0016': 'No se encontró el usuario',
    '0066': "No tienes los permisos para usar este servicio",
    '0072': 'Formato del archivo no válido',
    '0090': 'Llave Inválida',
    '0091': 'API key has no user',
    '0092': 'You cannot use web editor service',
    '0093': 'Tu cuenta está inactiva',
    '0094': 'Orden no encontrada',
    '0095': 'Api Key no encontrada',
    '0102': 'Before Studio images length not equal with edited images length',
    '0103': 'After Studio images is empty',
    '0228': 'Esta imagen no te pertenece',
    '0259': 'Registro de Car Studio no encontrado',
    '0500': 'Ocurrió un error desconocido en el servidor',
};

// Custom error for better handling in the UI
export class CarStudioApiError extends Error {
    public interpretedMessage: string;
    public rawResponse: any;

    constructor(message: string, interpretedMessage: string, rawResponse: any) {
        super(message);
        this.name = 'CarStudioApiError';
        this.interpretedMessage = interpretedMessage;
        this.rawResponse = rawResponse;
    }
}

class CarStudioService {

    private static async makeRequest(url: string, options: RequestInit): Promise<any> {
        const fullUrl = `${PROXY_URL}${url}`;
        try {
            const response = await fetch(fullUrl, options);
            const result = await response.json();

            if (!response.ok || result.status === 'fail' || result.success === false) {
                const errorCode = result.error_code || result.code;
                const interpretedMessage = errorCode ? `${errorCode}: ${errorMap[errorCode] || 'Unknown API error code.'}` : result.message || 'API request failed';
                throw new CarStudioApiError(
                    `API Error: ${interpretedMessage}`,
                    interpretedMessage,
                    result
                );
            }
            return result;
        } catch (error) {
            if (error instanceof CarStudioApiError) {
                throw error;
            }
            console.error(`Network or parsing error for request to ${url}:`, error);
            const interpreted = "Network error. This could be a CORS proxy issue, an API downtime, or a network problem.";
            throw new CarStudioApiError(
                error instanceof Error ? error.message : String(error),
                interpreted,
                { error: 'Network request failed' }
            );
        }
    }
    
    // GET endpoint
    static async getRecordById(vehicleId: number, username: string): Promise<any> {
        const formData = new FormData();
        formData.append('id', String(vehicleId));
        formData.append('username', username);

        return this.makeRequest(API_URLS.GET, {
            method: 'POST',
            headers: { 'X-ApiKey': API_KEY },
            body: formData,
        });
    }

    // LIST endpoint
    static async listRecords(params: {
        username: string;
        pageNumber?: number;
        sortBy?: string;
        direction?: 'ASC' | 'DESC';
        limit?: number;
    }): Promise<any> {
        const formData = new FormData();
        formData.append('username', params.username);
        if (params.pageNumber !== undefined) formData.append('pageNumber', String(params.pageNumber));
        if (params.sortBy) formData.append('sortBy', params.sortBy);
        if (params.direction) formData.append('direction', params.direction);
        if (params.limit !== undefined) formData.append('limit', String(params.limit));

        return this.makeRequest(API_URLS.LIST, {
            method: 'POST',
            headers: { 'X-ApiKey': API_KEY },
            body: formData,
        });
    }

    // SEARCH endpoint
    static async searchRecords(params: { transactionId?: string; carStudioId?: string; orderId?: string }): Promise<any> {
        const queryParams = new URLSearchParams();
        if (params.transactionId) queryParams.append('transactionId', params.transactionId);
        if (params.carStudioId) queryParams.append('carStudioId', params.carStudioId);
        if (params.orderId) queryParams.append('orderId', params.orderId);

        const urlWithParams = `${API_URLS.SEARCH}?${queryParams.toString()}`;

        return this.makeRequest(urlWithParams, {
            method: 'GET',
            headers: { 'X-ApiKey': API_KEY },
        });
    }
    
    // UPLOAD IMAGES V2 endpoint
    static async uploadImagesWithUrlV2(
        images: { fileUrl: string; position: string }[],
        options: {
            plateImageUrl?: string;
            blurBackground?: boolean;
            blurLevel?: number;
            fileExtension?: 'PNG' | 'JPG';
            traceId?: string;
            dealerId?: string;
            chassisNumber?: string;
            plateNumber?: string;
            platformUrl?: string;
        }
    ): Promise<any> {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append(`images[${index}].fileUrl`, image.fileUrl);
            formData.append(`images[${index}].position`, image.position);
        });

        if (options.plateImageUrl) formData.append('plateImageUrl', options.plateImageUrl);
        if (options.blurBackground !== undefined) formData.append('blurBackground', String(options.blurBackground));
        if (options.blurLevel !== undefined) formData.append('blurLevel', String(options.blurLevel));
        if (options.fileExtension) formData.append('fileExtension', options.fileExtension);
        if (options.traceId) formData.append('traceId', options.traceId);
        if (options.dealerId) formData.append('dealerId', options.dealerId);
        if (options.chassisNumber) formData.append('chassisNumber', options.chassisNumber);
        if (options.plateNumber) formData.append('plateNumber', options.plateNumber);
        if (options.platformUrl) formData.append('platformUrl', options.platformUrl);

        return this.makeRequest(API_URLS.UPLOAD_V2, {
            method: 'POST',
            headers: { 'apiKey': API_KEY },
            body: formData,
        });
    }

    // WEB EDITOR LIST endpoint
    static async listWebEditorRecords(params: {
        pageNumber?: number;
        sortBy?: string;
        direction?: 'ASC' | 'DESC';
        limit?: number;
    }): Promise<any> {
        const formData = new FormData();
        if (params.pageNumber !== undefined) formData.append('pageNumber', String(params.pageNumber));
        if (params.sortBy) formData.append('sortBy', params.sortBy);
        if (params.direction) formData.append('direction', params.direction);
        if (params.limit !== undefined) formData.append('limit', String(params.limit));

        return this.makeRequest(API_URLS.WEB_EDITOR_LIST, {
            method: 'POST',
            headers: { 'apiKey': API_KEY },
            body: formData,
        });
    }

    // GET CREDIT endpoint
    static async getCredit(username: string): Promise<any> {
        const formData = new FormData();
        formData.append('username', username);

        return this.makeRequest(API_URLS.GET_CREDIT, {
            method: 'POST',
            headers: { 'X-ApiKey': API_KEY },
            body: formData,
        });
    }
}

export default CarStudioService;