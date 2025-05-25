export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'email' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  category: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: FieldOption[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number | string;
    max?: number | string;
    step?: number | string;
  };
  metadata?: Record<string, any>;
  position?: {
    page?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

export interface DocumentMetadata {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  created?: string;
  modified?: string;
  pageCount?: number;
  fieldsCount?: number;
  [key: string]: any;
}

export interface Form {
  id: string;
  name: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'other';
  size: number;
  filePath?: string;
  originalName: string;
  mimeType: string;
  lastModified: string;
  dateAdded: string;
  isFavorite: boolean;
  tags: string[];
  fields: FormField[];
  thumbnail?: string;
  previewUrl: string;
  source?: string;
  metadata: DocumentMetadata;
  status: 'draft' | 'processing' | 'ready' | 'error';
  error?: string;
  version: number;
}