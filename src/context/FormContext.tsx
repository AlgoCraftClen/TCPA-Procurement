import React, { createContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { formService } from '../services/formService';
import { profileService } from '../services/profileService';
import { documentProcessor } from '../services/documentProcessor';
import { FormContextType, ProcessedDocument } from './formContext.types';
import { Form, FormField } from '../types/Form';
import { AutofillProfile, ProfileField } from '../types/AutofillProfile';

const FormContext = createContext<FormContextType | undefined>(undefined);

export { FormContext };

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  // Forms state
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profiles state
  const [profiles, setProfiles] = useState<AutofillProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  // Fetch all forms
  const fetchForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await formService.getForms();
      setForms(data);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
      setError('Failed to load forms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all profiles
  const fetchProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    setProfilesError(null);
    try {
      const data = await profileService.getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
      setProfilesError('Failed to load profiles. Please try again.');
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchForms();
    fetchProfiles();
  }, [fetchForms, fetchProfiles]);

  // Add new forms
  const addForms = useCallback(async (newForms: Omit<Form, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const createdForms = await Promise.all(
        newForms.map(form => formService.createForm(form))
      );
      setForms(prev => [...prev, ...createdForms]);
      return createdForms;
    } catch (err) {
      console.error('Failed to add forms:', err);
      throw new Error('Failed to add forms');
    }
  }, []);
  
  // Validate form fields before processing
  const validateFormFields = useCallback((fields: FormField[]): boolean => {
    if (!Array.isArray(fields)) return false;
    return fields.every(field => 
      field && 
      typeof field.id === 'string' && 
      typeof field.type === 'string' &&
      typeof field.label === 'string' &&
      'required' in field &&
      'visible' in field
    );
  }, []);

  // Process document and extract fields with validation
  const processDocument = useCallback(async (file: File): Promise<ProcessedDocument> => {
    if (!file) {
      throw new Error('No file provided for processing');
    }
    
    try {
      const result = await documentProcessor.processFile(file);
      
      // Validate the extracted fields
      if (!validateFormFields(result.fields)) {
        throw new Error('Invalid fields extracted from document');
      }
      
      return {
        fields: result.fields,
        previewUrl: result.previewUrl,
        metadata: result.metadata
      };
    } catch (err) {
      console.error('Failed to process document:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to process document');
    }
  }, [validateFormFields]);
  
  // Form field management
  const updateFormField = useCallback(async (formId: string, fieldId: string, updates: Partial<FormField>) => {
    setForms(prev => 
      prev.map(form => {
        if (form.id === formId) {
          const updatedFields = form.fields.map(field => 
            field.id === fieldId ? { ...field, ...updates } : field
          );
          return { ...form, fields: updatedFields };
        }
        return form;
      })
    );
    
    try {
      await formService.updateForm(formId, {
        fields: forms.find(f => f.id === formId)?.fields || []
      });
    } catch (err) {
      console.error('Failed to update form field:', err);
      throw new Error('Failed to update form field');
    }
  }, [forms]);
  
  const addFormField = useCallback(async (formId: string, field: Omit<FormField, 'id'>) => {
    const newField = { ...field, id: uuidv4() };
    
    setForms(prev => 
      prev.map(form => 
        form.id === formId 
          ? { ...form, fields: [...form.fields, newField] } 
          : form
      )
    );
    
    try {
      await formService.updateForm(formId, {
        fields: [...(forms.find(f => f.id === formId)?.fields || []), newField]
      });
    } catch (err) {
      console.error('Failed to add form field:', err);
      throw new Error('Failed to add form field');
    }
  }, [forms]);
  
  const removeFormField = useCallback(async (formId: string, fieldId: string) => {
    setForms(prev =>
      prev.map(form => ({
        ...form,
        fields: form.fields.filter(field => field.id !== fieldId)
      }))
    );
    
    try {
      await formService.updateForm(formId, {
        fields: forms.find(f => f.id === formId)?.fields.filter(f => f.id !== fieldId) || []
      });
    } catch (err) {
      console.error('Failed to remove form field:', err);
      throw new Error('Failed to remove form field');
    }
  }, [forms]);
  
  // Toggle form favorite status
  const toggleFavorite = useCallback(async (formId: string, isFavorite: boolean) => {
    try {
      await formService.toggleFavorite(formId, isFavorite);
      setForms(prev => 
        prev.map(form => 
          form.id === formId ? { ...form, isFavorite } : form
        )
      );
    } catch (err) {
      console.error(`Failed to toggle favorite for form ${formId}:`, err);
      throw new Error('Failed to update form');
    }
  }, []);
  
  // Delete a form
  const deleteForm = useCallback(async (formId: string) => {
    try {
      await formService.deleteForm(formId);
      setForms(prev => prev.filter(form => form.id !== formId));
    } catch (err) {
      console.error(`Failed to delete form ${formId}:`, err);
      throw new Error('Failed to delete form');
    }
  }, []);
  
  // Update a form
  const updateForm = useCallback(async (formId: string, updates: Partial<Form>) => {
    try {
      const updated = await formService.updateForm(formId, updates);
      setForms(prev => 
        prev.map(form => form.id === formId ? { ...form, ...updated } : form)
      );
      return updated;
    } catch (err) {
      console.error(`Failed to update form ${formId}:`, err);
      throw new Error('Failed to update form');
    }
  }, []);



  // Create a new profile with optional fields
  const createProfile = useCallback(async (
    profile: Omit<AutofillProfile, 'id' | 'profile_fields'>,
    fields: Omit<ProfileField, 'id' | 'profile_id'>[] = []
  ): Promise<AutofillProfile> => {
    try {
      const createdProfile = await profileService.createProfile(profile, fields);
      setProfiles(prev => [...prev, createdProfile]);
      return createdProfile;
    } catch (err) {
      console.error('Failed to create profile:', err);
      throw new Error('Failed to create profile');
    }
  }, []);

  // Update a profile
  const updateProfile = useCallback(async (
    id: string, 
    updates: Partial<Omit<AutofillProfile, 'id' | 'profile_fields'>>,
    fields?: Array<Omit<ProfileField, 'profile_id'> & { id?: string }>
  ): Promise<AutofillProfile> => {
    try {
      const updated = await profileService.updateProfile(
        id, 
        updates, 
        fields || []
      );
      setProfiles(prev => 
        prev.map(p => {
          if (p.id === id) {
            return { 
              ...p, 
              ...updates,
              updated_at: new Date().toISOString()
            };
          }
          return p;
        })
      );
      return updated;
    } catch (err) {
      console.error(`Failed to update profile ${id}:`, err);
      throw new Error('Failed to update profile');
    }
  }, []);

  // Delete a profile
  const deleteProfile = useCallback(async (id: string) => {
    try {
      await profileService.deleteProfile(id);
      setProfiles(prev => prev.filter(profile => profile.id !== id));
    } catch (err) {
      console.error(`Failed to delete profile ${id}:`, err);
      throw new Error('Failed to delete profile');
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([fetchForms(), fetchProfiles()]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      throw new Error('Failed to refresh application data');
    }
  }, [fetchForms, fetchProfiles]);



  // Memoize the context value properly to prevent unnecessary re-renders
  const contextValue = useMemo<FormContextType>(() => ({
    // Forms state
    forms,
    isLoading,
    error: error as string | null,
    
    // Form actions
    fetchForms,
    addForms,
    updateForm,
    deleteForm,
    toggleFavorite,
    
    // Form Fields actions
    updateFormField,
    addFormField,
    removeFormField,
    
    // Profiles state
    profiles,
    isLoadingProfiles,
    profilesError: profilesError as string | null,
    
    // Profile actions
    fetchProfiles,
    addProfile: (profile, fields) => createProfile(profile, fields || []),
    updateProfile,
    deleteProfile,
    
    // Document Processing
    processDocument,
    
    // Data refresh
    refreshData,
  }), [
    forms,
    isLoading,
    error,
    profiles,
    isLoadingProfiles,
    profilesError,
    fetchForms,
    addForms,
    updateForm,
    deleteForm,
    toggleFavorite,
    updateFormField,
    addFormField,
    removeFormField,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    processDocument,
    refreshData
  ]);

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};