import type { Profile } from '../types/types';

export const KommoService = {
  /**
   * Sends lead data to the Kommo CRM webhook.
   * @param lead The user profile data to sync.
   */
  async syncLead(lead: Profile): Promise<{ success: boolean; message?: string }> {
    try {
      // Structure the payload as expected by Kommo or a middleware like Make/Zapier
      const payload = {
        lead_id: lead.id,
        name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
        email: lead.email,
        phone: lead.phone,
        source: lead.source || 'Portal TREFA',
        rfc: lead.rfc,
        asesor: lead.asesor_asignado_id,
        contactado: lead.contactado,
        tags: lead.metadata?.tags || [],
        last_updated: lead.updated_at,
      };

      console.log('Syncing to Kommo:', payload);
      
      // In a real application, you would make the fetch request here.
      // We are simulating the request for this example.
      // const response = await fetch(KOMMO_WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      
      // if (!response.ok) {
      //   throw new Error(`Kommo webhook failed with status ${response.status}`);
      // }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      return { success: true };
    } catch (error: any) {
      console.error('Failed to sync lead to Kommo:', error);
      return { success: false, message: error.message };
    }
  }
};