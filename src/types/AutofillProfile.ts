export interface ProfileField {
  id: string;
  name: string;
  value: string;
}

export interface AutofillProfile {
  id: string;
  name: string;
  type: 'personal' | 'company';
  description?: string;
  lastUpdated?: string;
  fields: ProfileField[];
}