import React, { useState, useEffect } from 'react';
// FIX: Import missing icons to resolve errors.
import { Upload, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FileUpload from './FileUpload';
import { DocumentService, UploadedDocument } from '../services/documentService';

interface DocumentUploadSectionProps {
  applicationId?: string;
  applicationStatus: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'pending_docs' | 'submitted' | 'draft';
}

const allRequiredDocuments = [
    { id: 'ine_front', name: 'INE (Frente)', required: true },
    { id: 'ine_back', name: 'INE (Reverso)', required: true },
    { id: 'proof_address', name: 'Comprobante de Domicilio', required: true },
    { id: 'proof_income', name: 'Comprobante de Ingresos (últimos 3 meses)', required: true },
];

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  applicationId,
  applicationStatus
}) => {
  const { user } = useAuth();
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocument>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && applicationId) {
      loadExistingDocuments();
    }
  }, [user?.id, applicationId]);

  const loadExistingDocuments = async () => {
    if (!user?.id || !applicationId) return;
    
    setLoading(true);
    try {
      const documents = await DocumentService.listDocuments(user.id, applicationId);
      const docsMap: Record<string, UploadedDocument> = {};
      documents.forEach(doc => {
        if(doc.documentType) {
            // Assuming one doc per type for this UI, taking the latest one
            docsMap[doc.documentType] = doc;
        }
      });
      setUploadedDocs(docsMap);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (document: UploadedDocument) => {
    setUploadedDocs(prev => ({
      ...prev,
      [document.documentType]: document
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'reviewing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'reviewing': return 'En Revisión';
      case 'rejected': return 'Rechazado';
      default: return 'Pendiente';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'reviewing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const documentsWithStatus = allRequiredDocuments.map(doc => {
    const uploadedDoc = uploadedDocs[doc.id];
    return {
        ...doc,
        status: uploadedDoc ? uploadedDoc.status : 'pending',
        uploadedFile: uploadedDoc
    };
  });
  
  const approvedCount = documentsWithStatus.filter(d => d.status === 'approved').length;


  if (applicationStatus === 'pending' || applicationStatus === 'rejected' || applicationStatus === 'draft' || !applicationId) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-primary-600" />
            Documentos Requeridos
          </h3>
          <p className="text-sm text-gray-600">
            Solicitud #{applicationId.substring(0,8)}... - Sube los documentos necesarios para continuar
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {approvedCount} de {allRequiredDocuments.length} aprobados
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ 
                width: `${(approvedCount / allRequiredDocuments.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
            <span className="text-sm text-gray-600">Cargando documentos...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentsWithStatus.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                  {getStatusIcon(doc.status)}
                  <span className="ml-1">{getStatusText(doc.status)}</span>
                </div>
              </div>

              {doc.uploadedFile && (
                <div className="mb-3">
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate" title={doc.uploadedFile.fileName}>{doc.uploadedFile.fileName}</span>
                      </div>
                      <a href={doc.uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 flex-shrink-0 ml-2">
                        Ver
                      </a>
                    </div>
                </div>
              )}

              {(doc.status === 'pending' || doc.status === 'rejected') && (
                <FileUpload
                  onFileSelect={() => {}} // Legacy callback, can be removed if not used elsewhere
                  onFileUpload={(uploadedDoc) => handleFileUpload(uploadedDoc)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  enableWordPressUpload={true} // This now means Supabase upload
                  applicationId={applicationId}
                  documentType={doc.id}
                  userId={user?.id}
                />
              )}
              
              {doc.status === 'rejected' && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-600">
                    Documento rechazado. Por favor, sube una nueva versión.
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">🔒 Almacenamiento Seguro</h4>
            <p className="text-sm text-gray-600">
              Tus documentos se almacenan de forma segura con encriptación y acceso controlado.
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadSection;