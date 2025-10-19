import { supabase } from '../../supabaseClient';
import type { Profile } from '../types/types';

/**
 * This service encapsulates functions that should only be callable by an admin or sales role.
 * RLS policies on the backend are the primary security layer. This service provides a clean
 * abstraction for the frontend.
 */
export const AdminService = {

  /**
   * Fetches all user profiles.
   * This relies on the 'get_leads_with_details' RPC function which is secured for admin/sales roles.
   */
  async getAllLeads(): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_leads_with_details');

    if (error) {
      console.error("Error fetching all leads:", error);
      throw new Error("Could not fetch leads. Ensure you have the required permissions.");
    }
    return data || [];
  },

  /**
   * Fetches the aggregated statistics for the CRM dashboard.
   */
  async getDashboardStats(): Promise<any> {
    const { data, error } = await supabase.rpc('get_crm_dashboard_stats');

    if (error) {
      console.error("Error fetching CRM dashboard stats:", error);
      throw new Error("Could not fetch dashboard stats.");
    }
    return data[0] || {};
  },

  /**
   * Fetches a single user's complete profile and related data.
   * @param userId The ID of the user to fetch.
   */
  async getClientProfile(userId: string): Promise<{ profile: Profile; applications: any[], tags: any[], reminders: any[], documents: any[] } | null> {
    const { data, error } = await supabase.rpc('get_secure_client_profile', { client_id: userId });

    if (error) {
      console.error("Error fetching secure client profile:", error);
      throw new Error("Could not fetch client profile. Ensure you have the required permissions.");
    }

    if (!data || !data.profile) {
        return null; // The function returns nothing if access is denied
    }

    return {
        profile: data.profile,
        applications: data.applications || [],
        tags: data.tags || [],
        reminders: data.reminders || [],
        documents: data.documents || [],
    };
  },

  async getAvailableTags(): Promise<any[]> {
    const { data, error } = await supabase.from('lead_tags').select('*').order('tag_name');
    if (error) throw error;
    return data || [];
  },

  async updateLeadTags(userId: string, tagIds: string[]): Promise<void> {
    const { error: deleteError } = await supabase.from('lead_tag_associations').delete().eq('lead_id', userId);
    if (deleteError) throw deleteError;

    if (tagIds.length > 0) {
      const associations = tagIds.map(tagId => ({ lead_id: userId, tag_id: tagId }));
      const { error: insertError } = await supabase.from('lead_tag_associations').insert(associations);
      if (insertError) throw insertError;
    }
  },
  
  async createReminder(reminder: { lead_id: string; agent_id: string; reminder_text: string; reminder_date: string; }): Promise<void> {
    const { error } = await supabase.from('lead_reminders').insert(reminder);
    if (error) throw error;
  },
  
  async updateReminder(reminderId: string, updates: { reminder_text?: string; reminder_date?: string; is_completed?: boolean; }): Promise<void> {
    const { error } = await supabase.from('lead_reminders').update(updates).eq('id', reminderId);
    if (error) throw error;
  },

  async deleteReminder(reminderId: string): Promise<void> {
    const { error } = await supabase.from('lead_reminders').delete().eq('id', reminderId);
    if (error) throw error;
  }
};