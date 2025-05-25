import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  File, 
  FileSpreadsheet, 
  FileText,
  Download,
  Pencil,
  Trash,
  Share,
  Clock,
  Tag,
  Eye,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import FormFieldsViewer from '../components/FormFieldsViewer';
import { useFormContext } from '../hooks/useFormContext';

const FormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { forms, toggleFavorite, deleteForm } = useFormContext();
  const [activeTab, setActiveTab] = useState<'preview' | 'fields'>('preview');
  
  const form = forms.find(f => f.id === id);
  
  if (!form) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h2>
        <p className="text-gray-600 mb-6">The form you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate('/library')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Library
        </button>
      </div>
    );
  }
  
  const getFormIcon = () => {
    switch (form.type) {
      case 'pdf':
        return <File className="text-red-500" size={24} />;
      case 'xlsx':
        return <FileSpreadsheet className="text-green-600" size={24} />;
      case 'docx':
        return <FileText className="text-blue-600" size={24} />;
      default:
        return <File className="text-gray-400" size={24} />;
    }
  };
  
  const handleDeleteForm = () => {
    if (window.confirm(`Are you sure you want to delete "${form.name}"?`)) {
      deleteForm(form.id);
      navigate('/library');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back
      </button>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between">
                <div className="flex items-start">
                  {getFormIcon()}
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock size={14} className="mr-1" />
                      <span>Last modified: {form.lastModified}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => toggleFavorite(form.id, !form.isFavorite)}
                    className={`p-2 rounded-full transition-colors
                      ${form.isFavorite 
                        ? 'text-yellow-400 bg-yellow-50 hover:bg-yellow-100' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Star 
                      size={20} 
                      className={form.isFavorite ? 'fill-yellow-400' : ''} 
                    />
                  </button>
                </div>
              </div>
              
              {form.tags && form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {form.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-b border-gray-200">
              <nav className="flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center transition-colors
                    ${activeTab === 'preview' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('fields')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center transition-colors
                    ${activeTab === 'fields' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <Copy size={16} className="mr-2" />
                  Form Fields
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'preview' ? (
                <div className="bg-gray-100 border border-gray-200 rounded-lg min-h-[500px] flex items-center justify-center">
                  {form.previewUrl ? (
                    <img 
                      src={form.previewUrl}
                      alt={`Preview of ${form.name}`}
                      className="max-w-full max-h-[500px] object-contain"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <div className="mb-4">
                        {getFormIcon()}
                      </div>
                      <h3 className="text-gray-900 font-medium mb-1">Preview not available</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Preview is not available for this form.
                      </p>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <ExternalLink size={16} className="mr-2" />
                        Open Form
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <FormFieldsViewer form={form} />
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => navigate(`/form/${form.id}/fill`)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="flex items-center">
                  <Pencil size={18} className="mr-2" />
                  Fill Form
                </span>
                <ArrowLeft size={18} className="rotate-180" />
              </button>
              
              <button className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="flex items-center">
                  <Download size={18} className="mr-2" />
                  Download Original
                </span>
              </button>
              
              <button className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="flex items-center">
                  <Share size={18} className="mr-2" />
                  Share Form
                </span>
              </button>
              
              <button
                onClick={handleDeleteForm}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <span className="flex items-center">
                  <Trash size={18} className="mr-2" />
                  Delete Form
                </span>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Form Details</h2>
            </div>
            <div className="p-4">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    {getFormIcon()}
                    <span className="ml-1">
                      {form.type === 'pdf' ? 'PDF Document' : 
                       form.type === 'xlsx' ? 'Excel Spreadsheet' : 
                       form.type === 'docx' ? 'Word Document' : 'Unknown'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {form.size ? `${(form.size / 1024).toFixed(1)} KB` : 'Unknown'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date Added</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {form.dateAdded || form.lastModified}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Source</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {form.source || 'Uploaded'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Field Count</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {form.fields ? form.fields.length : 0} fields detected
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormView;