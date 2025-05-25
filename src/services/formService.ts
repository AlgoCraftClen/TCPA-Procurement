import { supabase } from '../lib/supabase';
import { Form } from '../types/Form';

export const formService = {
  // Fetch all forms for the current user
  async getForms(): Promise<Form[]> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch a single form by ID
  async getFormById(id: string): Promise<Form | null> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching form ${id}:`, error);
      throw error;
    }

    return data;
  },

  // Create a new form
  async createForm(form: Omit<Form, 'id' | 'created_at' | 'updated_at'>): Promise<Form> {
    const { data, error } = await supabase
      .from('forms')
      .insert([form])
      .select()
      .single();

    if (error) {
      console.error('Error creating form:', error);
      throw error;
    }

    return data;
  },

  // Update an existing form
  async updateForm(id: string, updates: Partial<Form>): Promise<Form> {
    const { data, error } = await supabase
      .from('forms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating form ${id}:`, error);
      throw error;
    }

    return data;
  },

  // Delete a form
  async deleteForm(id: string): Promise<void> {
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting form ${id}:`, error);
      throw error;
    }
  },

  // Toggle form favorite status
  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    await this.updateForm(id, { isFavorite });
  },
};
