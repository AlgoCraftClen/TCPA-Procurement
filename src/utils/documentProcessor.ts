import { PDFDocument } from 'pdf-lib';
// We need to keep PDFDropdown as a value import for instanceof checks
import { PDFDropdown } from 'pdf-lib';
import type { PDFField } from 'pdf-lib';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { ExtractedField, FieldType } from '../types/Form';

type PDFFormField = PDFField & {
  getDefaultValue?: () => unknown;
};

async function extractPDFFields(file: File): Promise<ExtractedField[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  
  return form.getFields().map((field: PDFField) => {
    const type = field.constructor.name
      .replace('PDF', '')
      .replace('Field', '')
      .toLowerCase() as FieldType;
      
    const pdfField = field as PDFFormField;
    const defaultValue = pdfField.getDefaultValue?.()?.toString();
      
    return {
      name: field.getName(),
      type,
      required: !field.isReadOnly(),
      defaultValue,
      options: type === 'select' && field.constructor.name === 'PDFDropdown'
        ? (field as unknown as PDFDropdown).getOptions()
        : undefined,
      section: field.getName().split('.').slice(0, -1).join(' > ') || 'Main'
    };
  });
}

async function extractWordFields(file: File): Promise<ExtractedField[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  const lines = result.value.split('\n').filter(line => line.trim());
  const fields: ExtractedField[] = [];
  let currentSection = 'Main';
  
  lines.forEach(line => {
    // Detect section headers (lines in all caps or followed by colon)
    if (line === line.toUpperCase() || line.endsWith(':')) {
      currentSection = line.replace(':', '').trim();
      return;
    }
    
    // Detect field patterns (text followed by underline/underscore)
    const fieldMatch = line.match(/^([^_:]+)[_:]\s*(.+)?$/);
    if (fieldMatch) {
      const [, name, defaultValue] = fieldMatch;
      fields.push({
        name: name.trim(),
        type: 'text' as FieldType,
        required: false,
        defaultValue: defaultValue?.trim(),
        section: currentSection
      });
    }
    
    // Detect checkboxes
    if (line.match(/\[\s*\]|\[x\]/i)) {
      fields.push({
        name: line.replace(/\[\s*\]|\[x\]/gi, '').trim(),
        type: 'checkbox' as FieldType,
        required: false,
        defaultValue: line.match(/\[x\]/i) ? 'true' : 'false',
        section: currentSection
      });
    }
  });
  
  return fields;
}

async function extractExcelFields(file: File): Promise<ExtractedField[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Get header row and first data row for type detection
  const [headers, firstDataRow] = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
  
  return headers.map((header, index) => {
    const sampleValue = firstDataRow?.[index];
    let type: FieldType = 'text';
    
    // Simple type detection
    if (typeof sampleValue === 'number') {
      type = 'number';
    } else if (sampleValue && !isNaN(Date.parse(sampleValue))) {
      type = 'date';
    } else if (typeof sampleValue === 'boolean') {
      type = 'checkbox';
    }
    
    return {
      name: header,
      type,
      required: false,
      defaultValue: sampleValue?.toString(),
      section: 'Sheet1'
    };
  });
}

export async function processDocument(file: File): Promise<ExtractedField[]> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    return extractPDFFields(file);
  }
  
  if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return extractWordFields(file);
  }
  
  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    return extractExcelFields(file);
  }
  
  throw new Error('Unsupported file type');
}
