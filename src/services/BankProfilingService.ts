import { supabase } from '../../supabaseClient';
import type { BankProfileData } from '../types/types';

export const BankProfilingService = {
  async saveUserBankProfile(userId: string, profileData: { 
      respuestas: any; 
      banco_recomendado: string; 
      banco_segunda_opcion: string | null; 
    }) {
    const payload = { 
      user_id: userId, 
      respuestas: profileData.respuestas,
      banco_recomendado: profileData.banco_recomendado,
      banco_segunda_opcion: profileData.banco_segunda_opcion,
      is_complete: true 
    };
    
    const { data, error } = await supabase
      .from('bank_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('user_id, is_complete') // Select user_id instead of id
      .single();

    if (error) {
      console.error('Error saving bank profile:', error.message, { code: error.code, details: error.details });
      throw new Error(`Could not save bank profile: ${error.message}`);
    }
    return data;
  },
  
  async getUserBankProfile(userId: string): Promise<BankProfileData | null> {
    const { data, error } = await supabase
      .from('bank_profiles')
      .select('is_complete, banco_recomendado, respuestas, banco_segunda_opcion') // Select all needed columns for BankProfileData
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() for robustness

    if (error) { // maybeSingle() doesn't throw on 'PGRST116', so check for other errors
      console.error('Error fetching bank profile:', error.message, { code: error.code, details: error.details });
      throw new Error(`Could not fetch bank profile: ${error.message}`);
    }
    return data;
  },

  async isBankProfileComplete(userId: string): Promise<boolean> {
    const profile = await this.getUserBankProfile(userId);
    return profile?.is_complete === true;
  }
};

export const getBankColor = (bankName: string): { bgColor: string, textColor: string, logoName: string } => {
    if (!bankName) return { bgColor: 'bg-gray-200', textColor: 'text-gray-800', logoName: '?' };
    const name = bankName.toLowerCase();
    
    if (name.includes('bbva')) return { bgColor: 'bg-blue-800', textColor: 'text-white', logoName: 'BBVA' };
    if (name.includes('scotiabank')) return { bgColor: 'bg-red-600', textColor: 'text-white', logoName: 'Scotiabank' };
    if (name.includes('banorte')) return { bgColor: 'bg-white', textColor: 'text-red-600', logoName: 'Banorte' };
    if (name.includes('banregio')) return { bgColor: 'bg-white', textColor: 'text-orange-500', logoName: 'Banregio' };
    if (name.includes('afirme')) return { bgColor: 'bg-green-600', textColor: 'text-white', logoName: 'Afirme' };
    if (name.includes('hey banco')) return { bgColor: 'bg-gray-800', textColor: 'text-white', logoName: 'Hey' };
    if (name.includes('kuna')) return { bgColor: 'bg-purple-600', textColor: 'text-white', logoName: 'Kuna' };
    
    return { bgColor: 'bg-gray-200', textColor: 'text-gray-800', logoName: bankName };
};

export const getBankLogo = (bankName: string): string => {
    if (!bankName) return '?';
    const name = bankName.toLowerCase();
    if (name.includes('banorte')) return "Ban";
    if (name.includes('banregio')) return "BanR";
    if (name.includes('hey banco')) return 'Hey Banco';
    return bankName.charAt(0).toUpperCase();
};