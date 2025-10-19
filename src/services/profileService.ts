import { supabase } from '../../supabaseClient'; // ✅ import directly from your Supabase client

export const ProfileService = {
  /** Actualiza o crea un perfil público del usuario autenticado */
  async updateProfile(profileData: {
    phone?: string;
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  }) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const { data: updatedProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileData }, { onConflict: 'id' })
      .single();

    if (upsertError) {
      console.error('Error upserting public profile:', upsertError);
      throw new Error(`Error al actualizar el perfil: ${upsertError.message}`);
    }

    if (!updatedProfile) {
      throw new Error('No se pudo obtener el perfil actualizado después de guardar.');
    }

    // Sync basic info to auth.users
    const userUpdates: any = {};
    if (profileData.phone) userUpdates.phone = profileData.phone;

    if (profileData.first_name || profileData.last_name) {
      userUpdates.data = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
      };
    }

    if (Object.keys(userUpdates).length > 0) {
      const { error: userSyncError } = await supabase.auth.updateUser(userUpdates);
      if (userSyncError) {
        console.warn('Could not sync all data to auth.users:', userSyncError.message);
      }
    }

    return updatedProfile;
  },

  /** Obtiene el perfil público de un usuario por ID */
  async getProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error.message, {
        code: error.code,
        details: error.details,
      });
      throw new Error(`Could not fetch profile: ${error.message}`);
    }

    return profile;
  },

  /** Asigna un asesor disponible a un usuario (balancea por last_assigned_at) */
  async assignAdvisorToUser(userId: string) {
    try {
      const { data, error } = await supabase.rpc('assign_advisor', {
        user_id_to_assign: userId
      });

      if (error) {
        console.error('Error calling assign_advisor function:', error);
        throw new Error('Could not assign advisor via RPC.');
      }

      console.log('Successfully assigned advisor via RPC:', data);
      return data; // The RPC should return the assigned advisor's ID
    } catch (rpcError) {
      console.error('Caught exception in assignAdvisorToUser:', rpcError);
      throw rpcError;
    }
  },

  /** Sube la foto de perfil del usuario */
  async uploadProfilePicture(userId: string, file: File) {
    const extension = file.name.split('.').pop();
    const path = `public/avatars/${userId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(path, file, { upsert: false }); // Use upsert: false to ensure a new file is created

    if (uploadError) {
      console.error('Error uploading profile picture:', uploadError);
      throw new Error('Could not upload profile picture.');
    }

    const { data } = supabase.storage.from('profile-pictures').getPublicUrl(path);
    return data.publicUrl;
  },
};