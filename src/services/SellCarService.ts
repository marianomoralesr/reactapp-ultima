import { supabase } from '../../supabaseClient';
import type { UserVehicleForSale } from '../types/types';

export const SellCarService = {
  /**
   * Fetches all vehicle sale listings for a given user.
   * @param userId - The ID of the authenticated user.
   * @returns An array of the user's vehicle sale listings.
   */
  async getSellListings(userId: string): Promise<UserVehicleForSale[]> {
    const { data, error } = await supabase
      .from('user_vehicles_for_sale')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user sell listings:', error);
      throw new Error('No se pudieron obtener tus vehículos en venta.');
    }
    return data || [];
  },

  /**
   * Creates or updates a vehicle sale listing.
   * @param listingData - The data for the listing. Must include the user_id.
   * @returns The created or updated listing object.
   */
  async createOrUpdateSellListing(listingData: Partial<UserVehicleForSale>): Promise<UserVehicleForSale> {
    if (!listingData.user_id) {
        throw new Error("User ID is required to save a listing.");
    }
    
    const { data, error } = await supabase
      .from('user_vehicles_for_sale')
      .upsert(listingData) // upsert will create if `id` is missing, update if it exists
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating sell listing:', error);
      throw new Error('No se pudo guardar la información de tu vehículo.');
    }
    return data;
  },
};