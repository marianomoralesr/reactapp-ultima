import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Camera, CheckCircle, Trash2 } from 'lucide-react';
import { DocumentService, UploadedDocument } from '../services/documentService';
import IDScanner from './IDScanner';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileUpload?: (document: UploadedDocument) => void;
  onFileDelete?: (documentId: string, documentType: string) => void;
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  maxTotalSizeMB?: number;
  enableWordPressUpload?: boolean;
  applicationId?: string;
  documentType?: string;
  userId?: string | null;
  allowCameraScan?: boolean;
  existingDocuments?: UploadedDocument[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileUpload,
  onFileDelete,
  accept,
  multiple = false,
  maxFiles = 1,
  maxTotalSizeMB = 5,
  enableWordPressUpload = false,
  applicationId,
  documentType,
  userId,
  allowCameraScan = false,
  existingDocuments = [],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileCheck = /Mobi|Android/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);
  }, []);

  const handleFileUpload = async (filesToUpload: File[]) => {
    if (!applicationId || !documentType || !userId) {
      setError("Error de configuración: Faltan propiedades para la subida de archivos.");
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      for (const file of filesToUpload) {
        const uploadedDocument = await DocumentService.uploadDocument(file, applicationId, documentType, userId);
        if (onFileUpload) {
          onFileUpload(uploadedDocument);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al subir los archivos.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const onDrop = useCallback(async (acceptedFiles: FileList | null) => {
    if (!acceptedFiles) return;
    const newFiles = Array.from(acceptedFiles);
    setError(null);

    if (newFiles.length + existingDocuments.length > maxFiles) {
      setError(`No puedes subir más de ${maxFiles} archivos.`);
      return;
    }

    const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > maxTotalSizeMB * 1024 * 1024) {
      setError(`El tamaño total no puede exceder ${maxTotalSizeMB}MB.`);
      return;
    }

    if (enableWordPressUpload) {
      await handleFileUpload(newFiles);
    } else {
      onFileSelect(newFiles);
    }
  }, [existingDocuments.length, maxFiles, maxTotalSizeMB, onFileSelect, enableWordPressUpload, applicationId, documentType, userId, onFileUpload]);
  
  const handleDelete = async (doc: UploadedDocument) => {
    if (!onFileDelete || !window.confirm(`¿Estás seguro de que quieres eliminar ${doc.fileName}?`)) return;
    try {
        await DocumentService.deleteDocument(doc);
        onFileDelete(doc.id, doc.documentType);
    } catch (e: any) {
        setError(`No se pudo eliminar el archivo: ${e.message}`);
    }
  };

  const handleScanCapture = async (file: File) => {
    setIsScannerOpen(false);
    setError(null);
    if (enableWordPressUpload) {
        await handleFileUpload([file]);
    } else {
        onFileSelect([file]);
    }
  };

  const canUploadMore = existingDocuments.length < maxFiles;
  
  return (
    <div>
      {existingDocuments.length > 0 && (
        <div className="space-y-2 mb-3">
            {existingDocuments.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate" title={doc.fileName}>{doc.fileName}</span>
                    </div>
                    {onFileDelete && (
                        <button type="button" onClick={() => handleDelete(doc)} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
      )}
      {canUploadMore && (
        <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-auto min-h-[8rem] p-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 ${isUploading ? 'cursor-wait' : 'hover:bg-gray-100'}`}>
            <div className="flex flex-col items-center justify-center text-center">
                {isUploading ? (
                <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
                    <p className="text-sm text-gray-500">Subiendo...</p>
                </>
                ) : (
                <>
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-primary-600">Click para subir</span> o arrastra</p>
                    <p className="text-xs text-gray-400">PDF, JPG, PNG, ZIP ({maxFiles - existingDocuments.length} restantes)</p>
                    {allowCameraScan && isMobile && (
                        <div className='mt-4 w-full'>
                            <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
                            <div className="relative flex justify-center text-sm"><span className="bg-gray-50 px-2 text-gray-500">o</span></div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setIsScannerOpen(true); }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-100 rounded-lg hover:bg-primary-200 border border-primary-200 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                Escanear con Cámara
                            </button>
                        </div>
                    )}
                </>
                )}
            </div>
            <input type="file" className="hidden" accept={accept} multiple={multiple} onChange={e => onDrop(e.target.files)} disabled={isUploading} />
            </label>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {isScannerOpen && (
        <IDScanner
          onCapture={handleScanCapture}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
};

export default FileUpload;