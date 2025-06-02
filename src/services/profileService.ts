import { supabase } from '../lib/supabase';
import { AutofillProfile, ProfileField } from '../types/AutofillProfile';

export const profileService = {
  // Fetch all profiles for the current user
  async getProfiles(): Promise<AutofillProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, profile_fields(*)')
      .order('name');

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch a single profile by ID with its fields
  async getProfileById(id: string): Promise<AutofillProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, profile_fields(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching profile ${id}:`, error);
      throw error;
    }

    return data;
  },

  // Create a new profile with its fields
  async createProfile(profile: Omit<AutofillProfile, 'id' | 'profile_fields'>, fields: Omit<ProfileField, 'id' | 'profile_id'>[]): Promise<AutofillProfile> {
    // Start a transaction
    const { data, error } = await supabase.rpc('create_profile_with_fields', {
      p_name: profile.name,
      p_type: profile.type,
      p_description: profile.description || null,
      p_fields: fields
    });

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return data;
  },

  // Update a profile and its fields
  async updateProfile(
    id: string, 
    updates: Partial<Omit<AutofillProfile, 'id' | 'profile_fields'>>,
    fields: Array<Omit<ProfileField, 'profile_id'> & { id?: string }>
  ): Promise<AutofillProfile> {
    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      console.error(`Error updating profile ${id}:`, profileError);
      throw profileError;
    }

    // Update or create fields
    for (const field of fields) {
      if (field.id) {
        // Update existing field
        const { error: updateError } = await supabase
          .from('profile_fields')
          .update({
            name: field.name,
            value: field.value
          })
          .eq('id', field.id);

        if (updateError) {
          console.error(`Error updating field ${field.id}:`, updateError);
          throw updateError;
        }
      } else {
        // Create new field
        const { error: createError } = await supabase
          .from('profile_fields')
          .insert([{
            profile_id: id,
            name: field.name,
            value: field.value
          }]);

        if (createError) {
          console.error('Error creating field:', createError);
          throw createError;
        }
      }
    }


    // Return the updated profile with all fields
    return this.getProfileById(id) as Promise<AutofillProfile>;
  },

  // Delete a profile and its fields
  async deleteProfile(id: string): Promise<void> {
    // Delete the profile (cascades to profile_fields due to foreign key)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting profile ${id}:`, error);
      throw error;
    }
  },

  // Get fields for a specific profile
  async getProfileFields(profileId: string): Promise<ProfileField[]> {
    const { data, error } = await supabase
      .from('profile_fields')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error(`Error fetching fields for profile ${profileId}:`, error);
      throw error;
    }

    return data || [];
  },
};
