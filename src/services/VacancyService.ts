import { supabase } from '../../supabaseClient';
import type { Vacancy, JobApplication } from '../types/types';

const CV_BUCKET = 'cv-uploads';
const VACANCY_IMAGE_BUCKET = 'vacancy-images';

export const VacancyService = {
  // --- Public Methods ---
  
  async getPublicVacancies(): Promise<Vacancy[]> {
    const { data, error } = await supabase
      .from('vacancies')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public vacancies:', error);
      throw new Error('Could not fetch job vacancies.');
    }
    return data || [];
  },

  async getVacancyById(id: string): Promise<Vacancy | null> {
    const { data, error } = await supabase
      .from('vacancies')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching vacancy by ID:', error);
      throw new Error('Could not fetch job vacancy.');
    }
    return data;
  },

  async submitApplication(applicationData: {
    vacancy_id: string;
    candidate_name: string;
    candidate_email: string;
    candidate_phone: string;
    cvFile: File;
    user_id?: string;
  }): Promise<JobApplication> {
    const { cvFile, ...rest } = applicationData;
    
    // 1. Upload CV to Supabase Storage
    const fileExt = cvFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${applicationData.vacancy_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(CV_BUCKET)
      .upload(filePath, cvFile);

    if (uploadError) {
      console.error('Error uploading CV:', uploadError);
      throw new Error('Could not upload your CV. Please try again.');
    }

    // 2. Create the application record in the database
    const { data: dbData, error: dbError } = await supabase
      .from('job_applications')
      .insert({ ...rest, cv_file_path: filePath })
      .select()
      .single();
    
    if (dbError) {
      console.error('Error creating application record:', dbError);
      await supabase.storage.from(CV_BUCKET).remove([filePath]);
      throw new Error('Could not submit your application.');
    }

    return dbData;
  },

  // --- Admin Methods ---

  async uploadVacancyImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(VACANCY_IMAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading vacancy image:', uploadError);
      throw new Error('Could not upload vacancy image.');
    }

    const { data: { publicUrl } } = supabase.storage
      .from(VACANCY_IMAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async getAllVacanciesForAdmin(): Promise<Vacancy[]> {
     const { data, error } = await supabase
        .rpc('get_vacancies_with_application_count');
        
    if (error) {
             console.error('Error fetching admin vacancies from RPC:', error);
        // Check for specific permission error from our RPC function
        if (error.message.includes('Permission denied')) {
            throw new Error('No tienes permiso para ver las vacantes. Asegúrate de que tu cuenta tenga el rol de "admin" o "sales".');
        }
        throw new Error(`Error al cargar vacantes: ${error.message}`);
    }
    return (data as any) || [];
  },

  async createVacancy(vacancyData: Partial<Omit<Vacancy, 'created_at' | 'updated_at'>>): Promise<Vacancy> {
    const { data, error } = await supabase
        .from('vacancies')
        .insert(vacancyData)
        .select()
        .single();
    if (error) {
      console.error('Error creating vacancy:', error);
      throw new Error('Failed to create vacancy.');
    }
    return data;
  },

  async updateVacancy(id: string, vacancyData: Partial<Omit<Vacancy, 'id' | 'created_at' | 'updated_at'>>): Promise<Vacancy> {
    const { data, error } = await supabase
        .from('vacancies')
        .update(vacancyData)
        .eq('id', id)
        .select()
        .single();
    if (error) {
      console.error('Error updating vacancy:', error);
      throw new Error('Failed to update vacancy.');
    }
    return data;
  },
  
  async getApplicationsForVacancy(vacancyId: string): Promise<JobApplication[]> {
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('vacancy_id', vacancyId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      throw new Error('Could not fetch applications for this vacancy.');
    }

    const applicationsWithUrls = await Promise.all(
        (applications || []).map(async (app) => {
            const { data: signedUrlData, error: urlError } = await supabase
                .storage
                .from(CV_BUCKET)
                .createSignedUrl(app.cv_file_path, 3600); // URL valid for 1 hour

            if (urlError) {
                console.warn(`Could not get signed URL for ${app.cv_file_path}:`, urlError);
                return { ...app, cv_url: '#' };
            }
            return { ...app, cv_url: signedUrlData.signedUrl };
        })
    );

    return applicationsWithUrls;
  },
};