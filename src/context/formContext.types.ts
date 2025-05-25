import { Form, FormField } from '../types/Form';
import { AutofillProfile, ProfileField } from '../types/AutofillProfile';

export interface ProcessedDocument {
  fields: FormField[];
  previewUrl: string;
  metadata: Record<string, unknown>;
}

export interface FormContextType {
  // Forms state
  forms: Form[];
  isLoading: boolean;
  error: string | null;
  
  // Form actions
  fetchForms: () => Promise<void>;
  addForms: (forms: Omit<Form, 'id' | 'created_at' | 'updated_at'>[]) => Promise<Form[]>;
  createForm: (form: Omit<Form, 'id' | 'created_at' | 'updated_at'>) => Promise<Form>;
  updateForm: (id: string, updates: Partial<Form>) => Promise<Form>;
  deleteForm: (id: string) => Promise<void>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  
  // Form Fields actions
  updateFormField: (formId: string, fieldId: string, updates: Partial<FormField>) => Promise<void>;
  addFormField: (formId: string, field: Omit<FormField, 'id'>) => Promise<void>;
  removeFormField: (formId: string, fieldId: string) => Promise<void>;
  
  // Profiles state
  profiles: AutofillProfile[];
  isLoadingProfiles: boolean;
  profilesError: string | null;
  
  // Profile actions
  fetchProfiles: () => Promise<void>;
  addProfile: (profile: Omit<AutofillProfile, 'id' | 'profile_fields'>, fields?: Omit<ProfileField, 'id' | 'profile_id'>[]) => Promise<AutofillProfile>;
  updateProfile: (
    id: string, 
    updates: Partial<Omit<AutofillProfile, 'id' | 'profile_fields'>>,
    fields?: Array<Omit<AutofillProfile['fields'][number], 'profile_id'> & { id?: string }>
  ) => Promise<AutofillProfile>;
  deleteProfile: (id: string) => Promise<void>;
  
  // Document Processing
  processDocument: (file: File) => Promise<ProcessedDocument>;
  
  // Data refresh
  refreshData: () => Promise<void>;
}
