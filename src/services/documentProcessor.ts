import { FormField, FieldType } from '../types/Form';
import { PDFDocument } from 'pdf-lib';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

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
  rawText: string;
}

// Helper function to extract text from PDF
async function extractTextFromPdf(pdfBytes: Uint8Array): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    let text = '';
    
    // For PDF text extraction, we'll need a more robust solution in production
    // This is a simplified version that works with some PDFs
    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      // Type definition for PDF.js text item
      type PDFTextItem = { str: string };
      type PDFTextContent = { items: PDFTextItem[] };
      
      // Use type assertion for PDF.js specific methods
      const pdfJsPage = page as unknown as { getTextContent: () => Promise<PDFTextContent> };
      const content = await pdfJsPage.getTextContent?.();
      if (content?.items) {
        text += content.items.map(item => item.str || '').join(' ') + '\n\n';
      }
    }
    
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

// Helper function to analyze text and extract potential form fields
function analyzeTextForFields(text: string): FormField[] {
  const fields: FormField[] = [];
  
  // Common field patterns to look for
  const fieldPatterns = [
    { regex: /(name|full name|fullname|your name)/i, type: 'text' as FieldType, label: 'Full Name' },
    { regex: /(email|e-mail|email address)/i, type: 'email' as FieldType, label: 'Email' },
    { regex: /(phone|phone number|telephone)/i, type: 'text' as FieldType, label: 'Phone Number' },
    { regex: /(address|street address)/i, type: 'text' as FieldType, label: 'Address' },
    { regex: /(city|town)/i, type: 'text' as FieldType, label: 'City' },
    { regex: /(state|province|region)/i, type: 'text' as FieldType, label: 'State/Province' },
    { regex: /(zip|zip code|postal code)/i, type: 'text' as FieldType, label: 'ZIP/Postal Code' },
    { regex: /(country)/i, type: 'text' as FieldType, label: 'Country' },
    { regex: /(date)/i, type: 'date' as FieldType, label: 'Date' },
    { regex: /(signature)/i, type: 'text' as FieldType, label: 'Signature' },
  ];
  
  // Track found fields to avoid duplicates
  const foundFields = new Set<string>();
  const lines = text.split('\n');
  
  // Check each line for potential fields
  for (const line of lines) {
    if (!line.trim()) continue;
    
    for (const pattern of fieldPatterns) {
      if (pattern.regex.test(line) && !foundFields.has(pattern.label)) {
        fields.push({
          id: pattern.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          type: pattern.type,
          label: pattern.label,
          required: false,
          placeholder: `Enter ${pattern.label.toLowerCase()}`,
          category: 'Personal',
          value: ''
        });
        foundFields.add(pattern.label);
        break;
      }
    }
  }
  
  // If no fields found, add some default fields
  if (fields.length === 0) {
    fields.push(
      {
        id: 'full-name',
        type: 'text' as FieldType,
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your full name',
        category: 'Personal',
        value: ''
      },
      {
        id: 'email',
        type: 'email' as FieldType,
        label: 'Email',
        required: true,
        placeholder: 'Enter your email',
        category: 'Contact',
        value: ''
      },
      {
        id: 'phone',
        type: 'text' as FieldType,
        label: 'Phone Number',
        required: false,
        placeholder: 'Enter your phone number',
        category: 'Contact',
        value: ''
      }
    );
  }
  
  return fields;
}

export const documentProcessor = {
  async processFile(file: File): Promise<ProcessedDocument> {
    const previewUrl = URL.createObjectURL(file);
    const fileType = this.detectFileType(file);
    
    try {
      switch (fileType) {
        case 'pdf':
          return await this.processPdf(file, previewUrl);
        case 'docx':
          return await this.processDocx(file, previewUrl);
        case 'xlsx':
          return await this.processXlsx(file, previewUrl);
        default:
          throw new Error('Unsupported file type');
      }
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      throw error;
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
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      
      // Extract text from PDF
      const text = await extractTextFromPdf(pdfBytes);
      
      // Analyze text to find potential form fields
      const fields = analyzeTextForFields(text);
      
      // Get PDF metadata
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      return {
        fields,
        previewUrl,
        pages: pdfDoc.getPageCount(),
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          author: undefined,
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        },
        rawText: text
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  },
  
  async processDocx(file: File, previewUrl: string): Promise<ProcessedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      // Analyze text to find potential form fields
      const fields = analyzeTextForFields(text);
      
      // Add default category to fields
      const fieldsWithCategory = fields.map(field => ({
        ...field,
        category: 'General',
        value: ''
      }));
      
      return {
        fields: fieldsWithCategory,
        previewUrl,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          author: undefined,
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        },
        rawText: text
      };
    } catch (error) {
      console.error('Error processing DOCX:', error);
      throw new Error('Failed to process DOCX file');
    }
  },
  
  async processXlsx(file: File, previewUrl: string): Promise<ProcessedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Use first row as headers
      const headers = (jsonData[0] as string[]) || [];
      const fields: FormField[] = [];
      
      headers.forEach((header, index) => {
        if (header && typeof header === 'string') {
          const id = `field-${index}`;
          fields.push({
            id,
            type: 'text' as FieldType,
            label: header.trim() || `Field ${index + 1}`,
            required: false,
            placeholder: `Enter ${header.trim() || `value ${index + 1}`}`,
            category: 'Data',
            value: ''
          });
        }
      });
      
      // If no headers found, add a default field
      if (fields.length === 0) {
        fields.push({
          id: 'data',
          type: 'text' as FieldType,
          label: 'Data',
          required: false,
          placeholder: 'Enter data',
          category: 'General',
          value: ''
        });
      }
      
      return {
        fields,
        previewUrl,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          author: undefined,
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        },
        rawText: XLSX.utils.sheet_to_csv(worksheet)
      };
    } catch (error) {
      console.error('Error processing XLSX:', error);
      throw new Error('Failed to process XLSX file');
    }
  },
  
  async extractTextFromFile(file: File): Promise<string> {
    const fileType = this.detectFileType(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (fileType === 'pdf') {
        return await extractTextFromPdf(new Uint8Array(arrayBuffer));
      }
      
      if (fileType === 'docx') {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      }
      
      if (fileType === 'xlsx') {
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        return XLSX.utils.sheet_to_csv(worksheet);
      }
      
      // For unsupported file types, return empty string
      return '';
    } catch (error) {
      console.error(`Error extracting text from ${fileType}:`, error);
      return '';
    }
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
