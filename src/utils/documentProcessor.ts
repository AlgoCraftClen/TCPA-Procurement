import { PDFDocument } from 'pdf-lib';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { ExtractedField, FieldType } from '../types/Form';

async function extractPDFFields(file: File): Promise<ExtractedField[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  
  return form.getFields().map(field => ({
    name: field.getName(),
    type: field.constructor.name.replace('PDF', '').replace('Field', '').toLowerCase() as FieldType,
    required: !field.isReadOnly(),
  }));
}

async function extractWordFields(file: File): Promise<ExtractedField[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  // Simple heuristic to find potential form fields in Word docs
  const lines = result.value.split('\n');
  return lines
    .filter(line => line.match(/:/) && line.length < 100)
    .map(line => {
      const [name] = line.split(':');
      return {
        name: name.trim(),
        type: 'text' as FieldType,
        required: false,
      };
    });
}

async function extractExcelFields(file: File): Promise<ExtractedField[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Get header row as field names
  const headers = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 })[0];
  
  return headers.map(header => ({
    name: header,
    type: 'text' as FieldType,
    required: false,
  }));
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
