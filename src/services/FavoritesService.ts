import { supabase } from '../../supabaseClient';

export class FavoritesService {
  /**
   * Fetches the number of users who have favorited a specific vehicle.
   * @param vehicleId - The ID of the vehicle.
   * @returns The count of favorites.
   */
  static async getFavoriteCountByVehicleId(vehicleId: number): Promise<number> {
    const { count, error } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true }) // head: true makes it faster as it doesn't return data
      .eq('vehicle_id', vehicleId);

    if (error) {
      console.error('Error fetching favorite count:', error);
      return 0; // Return 0 on error
    }

    return count || 0;
  }

  /**
   * Fetches favorite counts for multiple vehicles in a single request.
   * @param vehicleIds - An array of vehicle IDs.
   * @returns A record mapping vehicleId to its favorite count.
   */
  static async getFavoriteCounts(vehicleIds: number[]): Promise<Record<number, number>> {
    if (vehicleIds.length === 0) return {};

    const { data, error } = await supabase
      .from('user_favorites')
      .select('vehicle_id')
      .in('vehicle_id', vehicleIds);
      
    if (error) {
      console.error('Error fetching favorite counts in batch:', error);
      return {};
    }

    const counts: Record<number, number> = {};
    // Initialize all requested vehicle IDs with a count of 0
    vehicleIds.forEach(id => {
      counts[id] = 0;
    });

    // Increment the count for each favorite found
    if (data) {
      for (const row of data) {
        if (row.vehicle_id) {
          counts[row.vehicle_id]++;
        }
      }
    }

    return counts;
  }
}