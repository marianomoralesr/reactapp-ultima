import { supabase } from '../../supabaseClient';
import type { InspectionReportData } from '../types/types';

export const InspectionService = {
  /**
   * Fetches an inspection report for a specific vehicle ID.
   * @param vehicleId - The WordPress ID of the vehicle.
   * @returns The inspection data or null if not found.
   */
  async getInspectionByVehicleId(vehicleId: number): Promise<InspectionReportData | null> {
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      // FIX: Improved error logging to be more descriptive than '[object Object]'.
      console.error(`Error fetching inspection data for vehicleId ${vehicleId}: ${error.message}`, {
          details: error.details,
          code: error.code,
      });
      throw new Error(`No se pudo obtener el reporte de inspección: ${error.message}`);
    }
    return data;
  },

  /**
   * Creates or updates an inspection report for a vehicle.
   * It uses the vehicle_id as the conflict target for the upsert operation.
   * @param inspectionData - The full inspection data object.
   * @returns The created or updated inspection data.
   */
  async upsertInspection(inspectionData: Omit<InspectionReportData, 'id' | 'created_at' | 'updated_at'>): Promise<InspectionReportData> {
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .upsert(inspectionData, { onConflict: 'vehicle_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting inspection data:', error);
      throw new Error('Could not save inspection data.');
    }
    return data;
  }
};