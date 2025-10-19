import { supabase } from '../../supabaseClient';

export const PriceWatchService = {
  async getWatchesForUser(userId: string): Promise<number[]> {
    const { data, error } = await supabase
      .from('vehicle_price_watches')
      .select('vehicle_id')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching price watches:', error);
      return [];
    }
    return data.map(watch => watch.vehicle_id);
  },

  async addWatch(userId: string, vehicleId: number): Promise<void> {
    const { error } = await supabase
      .from('vehicle_price_watches')
      .insert({ user_id: userId, vehicle_id: vehicleId });
    if (error) {
      console.error('Error adding price watch:', error);
      throw error;
    }
  },

  async removeWatch(userId: string, vehicleId: number): Promise<void> {
    const { error } = await supabase
      .from('vehicle_price_watches')
      .delete()
      .match({ user_id: userId, vehicle_id: vehicleId });
    if (error) {
      console.error('Error removing price watch:', error);
      throw error;
    }
  }
};
