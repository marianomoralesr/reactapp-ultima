import { supabase } from '../../supabaseClient';
import { ApplicationService } from './ApplicationService';
import { DocumentService } from './documentService';

export const UserDataService = {

  /**
   * Gathers all of a user's data from multiple tables into a single JSON object.
   * @param userId The ID of the user.
   * @returns A JSON object containing the user's data.
   */
  async gatherUserData(userId: string): Promise<any> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw new Error("Could not fetch profile data.");

    const applications = await ApplicationService.getUserApplications(userId);
    
    const documentsByApp: { [appId: string]: any[] } = {};
    for (const app of applications) {
        const docs = await DocumentService.listDocuments(userId, app.id);
        documentsByApp[app.id] = docs.map(d => ({
            fileName: d.fileName,
            documentType: d.documentType,
            uploadedAt: d.uploadedAt,
            status: d.status,
        }));
    }

    return {
      profile,
      applications: applications.map(app => ({
        ...app,
        documents: documentsByApp[app.id] || [],
      })),
    };
  },

  /**
   * Triggers a browser download of the user's data as a JSON file.
   * @param userId The ID of the user.
   */
  async downloadUserData(userId: string): Promise<void> {
    try {
      const userData = await this.gatherUserData(userId);
      const jsonString = JSON.stringify(userData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trefa_user_data_${userId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download user data:", error);
      throw error;
    }
  },

  /**
   * Deletes sensitive user data while keeping their account active.
   * This includes documents and specific PII fields in their profile.
   * @param userId The ID of the user.
   */
/**
 * Deletes sensitive data from the current user's profile.
 */
async deleteSensitiveData(userId: string): Promise<void> {
    // 1. Fetch all applications for the user to get their IDs
    const applications = await ApplicationService.getUserApplications(userId);

    // 2. Delete all documents associated with each application
    for (const app of applications) {
        const documents = await DocumentService.listDocuments(userId, app.id);
        for (const doc of documents) {
            await DocumentService.deleteDocument(doc);
        }
    }
    
    // 3. Anonymize sensitive fields in the user's profile
    const profileUpdate = {
        address: undefined,
        city: undefined,
        state: undefined,
        zip_code: undefined,
        rfc: undefined,
        homoclave: undefined,
        birth_date: undefined,
        civil_status: undefined,
    };

    const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);

    if (profileError) {
        console.error('Error clearing sensitive profile data:', profileError);
        throw new Error('Could not clear sensitive profile data.');
    }
    
    console.log(`Sensitive data deleted for user ${userId}`);
  },

};
