import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApplicationService } from '../services/ApplicationService';
import { DocumentService, UploadedDocument } from '../services/documentService';
import FileUpload from './FileUpload';
import { Link } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DocumentUploadDashboardModuleProps {
  onDocumentsComplete?: () => void; // Callback when all required documents are uploaded
}

const DocumentUploadDashboardModule: React.FC<DocumentUploadDashboardModuleProps> = ({ onDocumentsComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, UploadedDocument[]>>({});
  const [missingDocumentsCount, setMissingDocumentsCount] = useState(0);

  const requiredDocumentsConfig = [
    { type: 'ine_front', label: 'INE (Frente)', allowCameraScan: true },
    { type: 'ine_back', label: 'INE (Reverso)', allowCameraScan: true },
    { type: 'proof_address', label: 'Comprobante de Domicilio', allowCameraScan: false },
    { type: 'proof_income', label: 'Comprobante de Ingresos', description: 'Sube tus 3 estados de cuenta o recibos de nómina más recientes (3 archivos PDF distintos). También puedes subir un solo archivo .ZIP con todos los documentos. Máximo 12 archivos.', allowCameraScan: false, multiple: true, maxFiles: 12, maxTotalSizeMB: 10 }
  ];

  const validateDocuments = useCallback((docs: Record<string, UploadedDocument[]>) => {
    console.log('DocumentUploadDashboardModule: validateDocuments called');
    let missingCount = 0;
    const requiredDocsTypes = requiredDocumentsConfig.filter(doc => doc.type !== 'proof_income').map(doc => doc.type);

    // Check for single-file required documents
    requiredDocsTypes.forEach(type => {
      if (!docs[type] || docs[type].length === 0) {
        missingCount++;
      }
    });

    // Check for income documents
    const incomeDocs = docs['proof_income'] || [];
    const hasZip = incomeDocs.some(doc => doc.fileName.toLowerCase().endsWith('.zip'));
    if (incomeDocs.length < 3 && !hasZip) {
      missingCount++;
    }
    
    setMissingDocumentsCount(missingCount);
    console.log('DocumentUploadDashboardModule: missingDocumentsCount:', missingCount);
    return missingCount === 0;
  }, [requiredDocumentsConfig]);

  const fetchApplicationAndDocuments = useCallback(async () => {
    if (!user) return;
    console.log('DocumentUploadDashboardModule: fetchApplicationAndDocuments called');
    setLoading(true);
    try {
      const latestApplication = await ApplicationService.getLatestApplicationForUser(user.id);
      console.log('DocumentUploadDashboardModule: latestApplication:', latestApplication);
      if (latestApplication && (latestApplication.status === 'pending_docs' || latestApplication.status === 'submitted')) {
        setApplicationId(latestApplication.id);
        const docs = await DocumentService.listDocuments(user.id, latestApplication.id);
        const docsMap = docs.reduce((acc, doc) => {
          if (doc.documentType) {
            if (!acc[doc.documentType]) acc[doc.documentType] = [];
            acc[doc.documentType].push(doc);
          }
          return acc;
        }, {} as Record<string, UploadedDocument[]>);
        setUploadedDocuments(docsMap);
        const allDocsComplete = validateDocuments(docsMap);
        console.log('DocumentUploadDashboardModule: allDocsComplete:', allDocsComplete);
        if (allDocsComplete) { // If all docs are complete
          if (latestApplication.status === 'pending_docs') { // And application was pending docs
            console.log('DocumentUploadDashboardModule: Updating application status to submitted');
            await ApplicationService.updateApplicationStatus(latestApplication.id, 'submitted');
            // Do NOT call onDocumentsComplete here. Let Dashboard re-evaluate its state.
            // The Dashboard's loadData will be triggered by the change in applications state.
          }
          // If already submitted, no need to call onDocumentsComplete from here.
          // The Dashboard will re-render and the module will hide itself if no pending_docs app.
        }
      } else {
        setApplicationId(null); // No active application or not in a relevant status
        console.log('DocumentUploadDashboardModule: No active application or not in relevant status');
      }
    } catch (error) {
      console.error("DocumentUploadDashboardModule: Error fetching application or documents:", error);
    } finally {
      setLoading(false);
    }
  }, [user, validateDocuments, onDocumentsComplete]);

  useEffect(() => {
    console.log('DocumentUploadDashboardModule: useEffect triggered');
    fetchApplicationAndDocuments();
  }, [fetchApplicationAndDocuments]);

  const handleFileUploaded = useCallback((doc: UploadedDocument) => {
    console.log('DocumentUploadDashboardModule: handleFileUploaded called');
    setUploadedDocuments(prev => {
      const newDocs = {
        ...prev,
        [doc.documentType]: [...(prev[doc.documentType] || []), doc]
      };
      validateDocuments(newDocs); // Re-validate after upload
      return newDocs;
    });
  }, [validateDocuments]);

  const handleFileDeleted = useCallback((documentId: string, documentType: string) => {
    console.log('DocumentUploadDashboardModule: handleFileDeleted called');
    setUploadedDocuments(prev => {
      const newDocs = {
        ...prev,
        [documentType]: (prev[documentType] || []).filter(d => d.id !== documentId)
      };
      validateDocuments(newDocs); // Re-validate after delete
      return newDocs;
    });
  }, [validateDocuments]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" /> Cargando documentos...
      </div>
    );
  }

  if (!applicationId || missingDocumentsCount === 0) {
    console.log('DocumentUploadDashboardModule: Not rendering - no application or no missing docs');
    return null; // Don't render if no active application or all documents are uploaded
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-300">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
        <h2 className="text-lg font-semibold text-yellow-800">Documentos Pendientes</h2>
      </div>
      <p className="text-sm text-gray-700 mb-4">
        Tu solicitud ha sido enviada, pero faltan algunos documentos importantes. Por favor, súbelos para evitar retrasos en la revisión de tu crédito.
      </p>

      <div className="space-y-4">
        {requiredDocumentsConfig.map(doc => (
          <div key={doc.type}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{doc.label} {doc.type === 'proof_income' && '(3 archivos o 1 .ZIP)'}</label>
            {doc.description && <p className="text-xs text-gray-500 mb-2">{doc.description}</p>}
            <FileUpload 
              onFileSelect={() => {}}
              onFileUpload={handleFileUploaded}
              onFileDelete={handleFileDeleted}
              accept=".pdf,.jpg,.jpeg,.png,.zip" 
              enableWordPressUpload={true} 
              applicationId={applicationId} 
              documentType={doc.type} 
              userId={user?.id || ''} 
              allowCameraScan={doc.allowCameraScan}
              existingDocuments={uploadedDocuments[doc.type] || []}
              multiple={doc.multiple}
              maxFiles={doc.maxFiles}
              maxTotalSizeMB={doc.maxTotalSizeMB}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <Link to={`/escritorio/aplicacion/${applicationId}`} className="text-sm font-semibold text-primary-600 hover:underline">
          Ver mi solicitud completa
        </Link>
      </div>
    </div>
  );
};

export default DocumentUploadDashboardModule;