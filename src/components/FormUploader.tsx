import React, { useState, useRef, useCallback } from 'react';
import { 
  UploadCloud, 
  File, 
  FileSpreadsheet, 
  FileText, 
  X,
  Loader,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useFormContext } from '../hooks/useFormContext';
import { documentProcessor } from '../services/documentProcessor';
import { v4 as uuidv4 } from 'uuid';

interface UploadFile extends File {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  progress?: number;
}

const FormUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addForms } = useFormContext();
  
  // File validation function
  const validateFile = useCallback((file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validTypes = ['pdf', 'xlsx', 'docx'];
    
    if (!ext || !validTypes.includes(ext)) {
      return false;
    }
    
    // 50MB max file size
    if (file.size > 50 * 1024 * 1024) {
      return false;
    }
    
    return true;
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter(validateFile)
      .map(file => ({
        ...file,
        id: uuidv4(),
        status: 'pending' as const,
        progress: 0
      }));
    
    if (droppedFiles.length === 0) {
      setError('Please upload valid PDF, XLSX, or DOCX files under 50MB.');
      return;
    }
    
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
        .filter(validateFile)
        .map(file => ({
          ...file,
          id: uuidv4(),
          status: 'pending' as const,
          progress: 0
        }));
      
      if (selectedFiles.length === 0) {
        setError('Please upload valid PDF, XLSX, or DOCX files under 50MB.');
        return;
      }
      
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (files.length === 1) {
      setError(null);
    }
  };

  const getFileIcon = (file: UploadFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (file.status === 'completed') {
      return <CheckCircle2 className="text-green-500" size={20} />;
    }
    
    if (file.status === 'error') {
      return <AlertCircle className="text-red-500" size={20} />;
    }
    
    if (file.status === 'processing') {
      return <Loader className="animate-spin text-blue-500" size={20} />;
    }
    
    switch (ext) {
      case 'pdf':
        return <File className="text-red-500" size={20} />;
      case 'xlsx':
        return <FileSpreadsheet className="text-green-600" size={20} />;
      case 'docx':
        return <FileText className="text-blue-600" size={20} />;
      default:
        return <File className="text-gray-400" size={20} />;
    }
  };
  
  const getStatusText = (file: UploadFile) => {
    switch (file.status) {
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return file.error || 'Error';
      default:
        return 'Pending';
    }
  };

  const processFile = async (file: UploadFile) => {
    try {
      // Update file status to processing
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing', progress: 10 } : f
      ));
      
      // Process the file using our document processor
      const processed = await documentProcessor.processFile(file);
      
      // Update progress
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress: 90 } : f
      ));
      
      // Create form data
      const formData = {
        id: uuidv4(),
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'other',
        size: file.size,
        filePath: URL.createObjectURL(file),
        originalName: file.name,
        mimeType: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
        dateAdded: new Date().toISOString(),
        isFavorite: false,
        tags: [],
        fields: processed.fields,
        previewUrl: processed.previewUrl,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          pageCount: processed.pages || 1,
          fieldsCount: processed.fields.length
        },
        status: 'ready',
        version: 1
      };
      
      // Mark as completed
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
      ));
      
      return formData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'error', 
          error: errorMessage,
          progress: 0
        } : f
      ));
      return null;
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Process files in parallel with a concurrency limit of 3
      const concurrencyLimit = 3;
      
      for (let i = 0; i < files.length; i += concurrencyLimit) {
        const batch = files.slice(i, i + concurrencyLimit);
        const processedBatch = await Promise.all(batch.map(processFile));
        const validForms = processedBatch.filter(Boolean);
        
        if (validForms.length > 0) {
          // Add the processed forms to the application state
          addForms(validForms);
        }
      }
      
      // Clear completed files after a short delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'completed'));
      }, 2000);
      
    } catch (error) {
      console.error('Error processing files:', error);
      setError('An error occurred while processing the files. Please try again.');
    } finally {
      setUploading(false);
    }
    
    try {
      // Process each file
      const newForms = await Promise.all(files.map(async (file) => {
        const ext = file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'xlsx' | 'docx';
        
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // In a real app, we would extract fields here
        // For now, we'll simulate field detection based on file type
        const fields = [];
        
        if (ext === 'pdf') {
          fields.push(
            { id: 'name', label: 'Name', type: 'text', required: true, category: 'Personal Information' },
            { id: 'email', label: 'Email', type: 'email', required: true, category: 'Contact Details' }
          );
        } else if (ext === 'xlsx') {
          fields.push(
            { id: 'date', label: 'Date', type: 'date', required: true, category: 'Invoice Details' },
            { id: 'amount', label: 'Amount', type: 'number', required: true, category: 'Invoice Details' }
          );
        } else {
          fields.push(
            { id: 'title', label: 'Title', type: 'text', required: true, category: 'Document Details' },
            { id: 'description', label: 'Description', type: 'textarea', required: false, category: 'Document Details' }
          );
        }
        
        return {
          id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: ext,
          size: file.size,
          lastModified: new Date().toLocaleDateString(),
          dateAdded: new Date().toLocaleDateString(),
          tags: [],
          isFavorite: false,
          fields,
          previewUrl
        };
      }));
      
      addForms(newForms);
      setFiles([]);
      setError(null);
    } catch (error) {
      console.error('Error processing files:', error);
      setError(`An error occurred while processing the files: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900">
              Drag and drop your forms here
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Supports PDF, XLSX, and DOCX files up to 50MB
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs text-gray-500">
                        {getStatusText(file)}
                      </span>
                      {file.progress !== undefined && file.progress > 0 && file.progress < 100 && (
                        <span className="ml-2 text-xs text-gray-500">
                          {file.progress}%
                        </span>
                      )}
                    </div>
                    {file.status === 'error' && file.error && (
                      <p className="mt-1 text-xs text-red-600 truncate">
                        {file.error}
                      </p>
                    )}
                    {file.progress !== undefined && file.progress > 0 && (
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {file.status !== 'processing' && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setFiles([])}
              disabled={uploading}
              className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Clear all
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Add More Files
              </button>
              <button
                type="button"
                onClick={uploadFiles}
                disabled={uploading || files.every(f => f.status === 'completed')}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  uploading || files.every(f => f.status === 'completed')
                    ? 'bg-blue-300'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {uploading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : files.some(f => f.status === 'completed') ? (
                  'Process More Files'
                ) : (
                  'Process Files'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormUploader;