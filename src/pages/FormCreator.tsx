import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { useFormContext } from '../hooks/useFormContext';
import { FormField, FieldType } from '../types/Form';

export default function FormCreator() {
  const navigate = useNavigate();
  const { createForm } = useFormContext();
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFields, setExtractedFields] = useState<FormField[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcessDocument = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call the document processor
      // For now, we'll use mock data
      const mockFields: FormField[] = [
        {
          id: crypto.randomUUID(),
          label: 'Full Name',
          type: 'text' as FieldType,
          required: true,
        },
        {
          id: crypto.randomUUID(),
          label: 'Email',
          type: 'email' as FieldType,
          required: true,
        },
        {
          id: crypto.randomUUID(),
          label: 'Phone',
          type: 'tel' as FieldType,
          required: false,
        },
        {
          id: crypto.randomUUID(),
          label: 'Address',
          type: 'text' as FieldType,
          required: true,
        },
        {
          id: crypto.randomUUID(),
          label: 'Date of Birth',
          type: 'date' as FieldType,
          required: true,
        },
        {
          id: crypto.randomUUID(),
          label: 'Agree to Terms',
          type: 'checkbox' as FieldType,
          required: true,
        },
        {
          id: crypto.randomUUID(),
          label: 'File Attachment',
          type: 'file' as FieldType,
          required: false,
        },
        {
          id: crypto.randomUUID(),
          label: 'Comments',
          type: 'textarea' as FieldType,
          required: false,
        }
      ];
      
      setExtractedFields(mockFields);
    } catch (error) {
      console.error('Error processing document:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateForm = () => {
    if (extractedFields.length === 0 || !file) return;
    
    const ext = file.name.split('.').pop()?.toLowerCase() || 'other';
    const formId = createForm({
      name: file.name.replace(/\.[^/.]+$/, '') || 'New Form',
      type: (['pdf','xlsx','docx'].includes(ext) ? ext : 'other') as 'pdf' | 'xlsx' | 'docx' | 'other',
      size: file.size,
      originalName: file.name,
      mimeType: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
      dateAdded: new Date().toISOString(),
      isFavorite: false,
      tags: [],
      previewUrl: '',
      fields: extractedFields,
      status: 'ready',
      version: 1,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, '') || 'New Form',
        pageCount: 1,
        fieldsCount: extractedFields.length
      }
    });
    
    navigate(`/form/${formId}/fill`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Form</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Upload Document</h2>
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <label className="cursor-pointer">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-1">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-gray-500 text-sm">
                  PDF, Word, or Excel files (max 10MB)
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-500 mr-3" />
              <span className="font-medium">{file.name}</span>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {file && (
          <button
            onClick={handleProcessDocument}
            disabled={isProcessing}
            className={`mt-4 w-full py-2 px-4 rounded-md text-white ${isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" />
                Processing...
              </span>
            ) : 'Extract Form Fields'}
          </button>
        )}
      </div>
      
      {extractedFields.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Extracted Fields</h2>
          <div className="space-y-4">
            {extractedFields.map((field) => (
              <div key={field.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{field.label}</h3>
                    <p className="text-sm text-gray-500">
                      {field.type} • {field.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleCreateForm}
            className="mt-6 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Create Form
          </button>
        </div>
      )}
    </div>
  );
}
