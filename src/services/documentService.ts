import { supabase } from '../../supabaseClient';

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  documentType: string;
  applicationId: string;
  userId: string;
  url: string; // This will be a signed URL for private files
  filePath: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
}

export interface DocumentListItem extends UploadedDocument {}

/**
 * Supabase Table and Storage configuration.
 *
 * REQUIRED SETUP IN SUPABASE:
 *
 * 1. STORAGE BUCKET:
 *    - Create a new bucket named 'application-documents'.
 *    - IMPORTANT: This should be a PRIVATE bucket.
 *
 * 2. `uploaded_documents` TABLE:
 *    - Create a table with the following schema:
 *      - id: uuid (Primary Key, default: gen_random_uuid())
 *      - user_id: uuid (Foreign Key to auth.users.id)
 *      - application_id: uuid (Foreign Key to financing_applications.id)
 *      - document_type: text
 *      - file_name: text
 *      - file_path: text (e.g., "public/user-id/app-id/doc-type/file.pdf")
 *      - file_size: integer
 *      - content_type: text
 *      - status: text (default: 'reviewing')
 *      - created_at: timestamp with time zone (default: now())
 *
 * 3. ROW LEVEL SECURITY (RLS):
 *    - On the `uploaded_documents` table:
 *      - Enable RLS.
 *      - Create a policy for SELECT: `(auth.uid() = user_id)`
 *      - Create a policy for INSERT: `(auth.uid() = user_id)`
 *    - On the 'application-documents' bucket:
 *      - Create a policy for SELECT: `(bucket_id = 'application-documents' AND (storage.foldername(name))[1] = auth.uid()::text)`
 *      - Create a policy for INSERT: `(bucket_id = 'application-documents' AND (storage.foldername(name))[1] = auth.uid()::text)`
 */
const BUCKET_NAME = 'application-documents';

export class DocumentService {
  static async uploadDocument(
    file: File,
    applicationId: string,
    documentType: string,
    userId: string
  ): Promise<UploadedDocument> {
    const filePath = `${userId}/${applicationId}/${documentType}/${Date.now()}-${file.name}`;

    // 1. Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw new Error(`Error al subir el archivo: ${uploadError.message}`);
    }
    
    if (!uploadData) {
        throw new Error('No se recibió confirmación de la subida del archivo.');
    }

    // 2. Insert metadata record into the database table
    const documentRecord = {
      user_id: userId,
      application_id: applicationId,
      document_type: documentType,
      file_name: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      content_type: file.type,
      status: 'reviewing' as const,
    };

    const { data: dbData, error: dbError } = await supabase
      .from('uploaded_documents')
      .insert(documentRecord)
      .select('id, file_name, file_size, content_type, created_at, document_type, application_id, user_id, file_path, status') // Select only needed columns
      .single();

    if (dbError) {
      console.error('Supabase DB insert error after upload:', dbError);
      // Attempt to clean up the orphaned file in storage
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      throw new Error(`Error al guardar los datos del documento: ${dbError.message}`);
    }
    
    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(dbData.file_path, 3600); // URL valid for 1 hour

    if (urlError) {
      console.error(`Could not get signed URL for ${dbData.file_path}:`, urlError);
    }
    
    return {
      id: dbData.id,
      fileName: dbData.file_name,
      fileSize: dbData.file_size,
      contentType: dbData.content_type,
      uploadedAt: dbData.created_at,
      documentType: dbData.document_type,
      applicationId: dbData.application_id,
      userId: dbData.user_id,
      url: signedUrlData?.signedUrl || '',
      filePath: dbData.file_path,
      status: dbData.status,
    };
  }

  static async listDocuments(
    userId: string,
    applicationId: string
  ): Promise<DocumentListItem[]> {
    const { data, error } = await supabase
      .from('uploaded_documents')
      .select('id, file_name, file_size, content_type, created_at, document_type, application_id, user_id, file_path, status') // Select only needed columns
      .eq('user_id', userId)
      .eq('application_id', applicationId);

    if (error) {
      console.error('Error fetching documents from Supabase:', error);
      throw new Error(`No se pudieron cargar los documentos: ${error.message}`);
    }

    if (!data) return [];
    
    // For private buckets, you would generate signed URLs here
    const documentsWithUrls = await Promise.all(
        data.map(async (doc) => {
            const { data: signedUrlData, error: urlError } = await supabase
                .storage
                .from(BUCKET_NAME)
                .createSignedUrl(doc.file_path, 3600); // URL valid for 1 hour

            if (urlError) {
                console.error(`Could not get signed URL for ${doc.file_path}:`, urlError);
                return { ...doc, url: '' }; // Handle error case
            }
            
            return {
                id: doc.id,
                fileName: doc.file_name,
                fileSize: doc.file_size,
                contentType: doc.content_type,
                uploadedAt: doc.created_at,
                documentType: doc.document_type,
                applicationId: doc.application_id,
                userId: doc.user_id,
                url: signedUrlData.signedUrl,
                filePath: doc.file_path,
                status: doc.status,
            };
        })
    );
    
    return documentsWithUrls as DocumentListItem[];
  }

  static async deleteDocument(document: UploadedDocument): Promise<void> {
    const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([document.filePath]);
    
    if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        throw new Error(`Failed to delete file from storage: ${storageError.message}`);
    }

    const { error: dbError } = await supabase
        .from('uploaded_documents')
        .delete()
        .eq('id', document.id);
    
    if (dbError) {
        console.error('Error deleting document record:', dbError);
        throw new Error(`Failed to delete document record: ${dbError.message}`);
    }
  }
}