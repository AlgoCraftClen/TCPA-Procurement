import { FormField, FieldType } from '../types/Form';

type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'unknown';

interface ProcessedDocument {
  fields: FormField[];
  previewUrl: string;
  pages?: number;
  metadata: {
    title: string;
    author?: string;
    created?: string;
    modified?: string;
  };
}

export const documentProcessor = {
  async processFile(file: File): Promise<ProcessedDocument> {
    const fileType = this.detectFileType(file);
    
    // Generate preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Process based on file type
    switch (fileType) {
      case 'pdf':
        return this.processPdf(file, previewUrl);
      case 'docx':
        return this.processDocx(file, previewUrl);
      case 'xlsx':
        return this.processXlsx(file, previewUrl);
      default:
        throw new Error('Unsupported file type');
    }
  },
  
  detectFileType(file: File): DocumentType {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx') return 'docx';
    if (ext === 'xlsx') return 'xlsx';
    return 'unknown';
  },
  
  async processPdf(file: File, previewUrl: string): Promise<ProcessedDocument> {
    // TODO: Implement PDF processing using PDF.js or a backend service
    // For now, return a mock implementation
    return {
      fields: [
        {
          id: 'full_name',
          label: 'Full Name',
          type: 'text',
          required: true,
          category: 'Personal Information',
          placeholder: 'John Doe'
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          category: 'Contact Information',
          placeholder: 'john@example.com'
        },
        {
          id: 'date',
          label: 'Date',
          type: 'date',
          required: true,
          category: 'Document Details'
        }
      ],
      previewUrl,
      pages: 1,
      metadata: {
        title: file.name.replace(/\.pdf$/i, ''),
        created: new Date().toISOString()
      }
    };
  },
  
  async processDocx(file: File, previewUrl: string): Promise<ProcessedDocument> {
    // TODO: Implement DOCX processing using mammoth.js or a backend service
    return {
      fields: [
        {
          id: 'document_title',
          label: 'Document Title',
          type: 'text',
          required: true,
          category: 'Document Information',
          placeholder: 'Document Title'
        },
        {
          id: 'author',
          label: 'Author',
          type: 'text',
          required: false,
          category: 'Document Information',
          placeholder: 'Author Name'
        },
        {
          id: 'content',
          label: 'Content',
          type: 'textarea',
          required: false,
          category: 'Document Content'
        }
      ],
      previewUrl,
      metadata: {
        title: file.name.replace(/\.docx?$/i, '')
      }
    };
  },
  
  async processXlsx(file: File, previewUrl: string): Promise<ProcessedDocument> {
    // TODO: Implement XLSX processing using xlsx or a backend service
    return {
      fields: [
        {
          id: 'date',
          label: 'Date',
          type: 'date',
          required: true,
          category: 'Record Details'
        },
        {
          id: 'amount',
          label: 'Amount',
          type: 'number',
          required: true,
          category: 'Financial',
          min: 0,
          step: '0.01'
        },
        {
          id: 'description',
          label: 'Description',
          type: 'text',
          required: false,
          category: 'Details'
        },
        {
          id: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          category: 'Classification',
          options: [
            { label: 'Office Supplies', value: 'office' },
            { label: 'Travel', value: 'travel' },
            { label: 'Equipment', value: 'equipment' },
            { label: 'Other', value: 'other' }
          ]
        }
      ],
      previewUrl,
      metadata: {
        title: file.name.replace(/\.xlsx?$/i, '')
      }
    };
  },
  
  // Helper to extract text from file (for future implementation)
  async extractTextFromFile(file: File): Promise<string> {
    // This would be implemented based on the file type
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        resolve(result ? result.toString() : '');
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  },
  
  // Helper to analyze text and extract fields (for future implementation)
  analyzeTextForFields(text: string): FormField[] {
    // This would use NLP or pattern matching to identify potential form fields
    const fields: FormField[] = [];
    
    // Simple pattern matching for common form fields
    const patterns = [
      { 
        pattern: /(name|full[\s-]?name)/i, 
        type: 'text' as FieldType, 
        category: 'Personal Information',
        label: 'Full Name'
      },
      { 
        pattern: /(email|e[- ]?mail)/i, 
        type: 'email' as FieldType, 
        category: 'Contact Information',
        label: 'Email Address'
      },
      { 
        pattern: /(phone|telephone|mobile)/i, 
        type: 'text' as FieldType, 
        category: 'Contact Information',
        label: 'Phone Number'
      },
      { 
        pattern: /(address)/i, 
        type: 'textarea' as FieldType, 
        category: 'Personal Information',
        label: 'Address'
      },
      { 
        pattern: /(date)/i, 
        type: 'date' as FieldType, 
        category: 'Date',
        label: 'Date'
      },
      { 
        pattern: /(amount|total|price|cost)/i, 
        type: 'number' as FieldType, 
        category: 'Financial',
        label: 'Amount',
        validation: { min: 0, step: '0.01' }
      },
      { 
        pattern: /(description|notes?|comments?)/i, 
        type: 'textarea' as FieldType, 
        category: 'Details',
        label: 'Description'
      },
    ];
    
    patterns.forEach(({ pattern, type, category, label, validation }, index) => {
      if (pattern.test(text)) {
        fields.push({
          id: `field_${index}_${Date.now()}`,
          label,
          type,
          required: false,
          category,
          validation
        });
      }
    });
    
    return fields;
  }
};
