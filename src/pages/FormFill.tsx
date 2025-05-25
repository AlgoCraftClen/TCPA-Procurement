import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  RefreshCw, 
  Clock, 
  CheckCircle,
  EyeIcon,
  Edit,
  Loader,
  AlertCircle
} from 'lucide-react';
import AutofillProfileSelector from '../components/AutofillProfileSelector';
import { useFormContext } from '../hooks/useFormContext';
import { FormField } from '../types/Form';
import { AutofillProfile } from '../types/AutofillProfile';

const FormFill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { forms, profiles } = useFormContext();
  
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
  
  const handleProfileSelect = (profileId: string | null) => {
    setSelectedProfileId(profileId);
    
    if (profileId) {
      const profile = profiles.find((p: AutofillProfile) => p.id === profileId);
      if (profile) {
        // Map profile field values to form fields
        const newValues: Record<string, string> = {};
        profile.fields.forEach((field: { id: string; name: string; value: string }) => {
          // Find matching form field by id or label
          const matchingField = form.fields.find(
            f => f.id === field.id || f.label.toLowerCase() === field.name.toLowerCase()
          );
          
          if (matchingField) {
            newValues[matchingField.id] = field.value;
          }
        });
        
        setFormValues(prev => ({
          ...prev,
          ...newValues
        }));
      }
    }
  };
  
  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear validation error when field is modified
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    form.fields.forEach(field => {
      if (field.required && (!formValues[field.id] || formValues[field.id].trim() === '')) {
        errors[field.id] = 'This field is required';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorId = Object.keys(validationErrors)[0];
      if (firstErrorId) {
        const element = document.getElementById(firstErrorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    setIsSaving(true);
    
    // Simulate saving/processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSaving(false);
    
    // Navigate to a success page or back to the form view
    navigate(`/form/${id}`, { 
      state: { message: 'Form filled successfully' } 
    });
  };
  
  const getFieldInput = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            id={field.id}
            type="text"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${validationErrors[field.id] ? 'border-red-300' : 'border-gray-300'}`}
          />
        );
      case 'email':
        return (
          <input
            id={field.id}
            type="email"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${validationErrors[field.id] ? 'border-red-300' : 'border-gray-300'}`}
          />
        );
      case 'number':
        return (
          <input
            id={field.id}
            type="number"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${validationErrors[field.id] ? 'border-red-300' : 'border-gray-300'}`}
          />
        );
      case 'date':
        return (
          <input
            id={field.id}
            type="date"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${validationErrors[field.id] ? 'border-red-300' : 'border-gray-300'}`}
          />
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${validationErrors[field.id] ? 'border-red-300' : 'border-gray-300'}`}
          >
            <option value="">Select an option</option>
            {field.options?.map((option: string, index: number) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            rows={3}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${validationErrors[field.id] ? 'border-red-300' : 'border-gray-300'}`}
          />
        );
      case 'checkbox':
        return (
          <input
            id={field.id}
            type="checkbox"
            checked={!!formValues[field.id]}
            onChange={(e) => handleInputChange(field.id, e.target.checked ? 'true' : '')}
            className={`h-4 w-4 rounded text-blue-600 focus:ring-blue-500
              ${validationErrors[field.id] ? 'border-red-300' : 'border-gray-300'}`}
          />
        );
      default:
        return (
          <input
            id={field.id}
            type="text"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${validationErrors[field.id] ? 'border-red-300' : 'border-gray-300'}`}
          />
        );
    }
  };
  
  const resetForm = () => {
    setFormValues({});
    setSelectedProfileId(null);
    setValidationErrors({});
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(`/form/${form.id}`)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to Form Details
      </button>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Fill Form: {form.name}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Clock size={14} className="mr-1" />
                <span>Last modified: {form.lastModified}</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {form.fields.length > 0 ? (
                  form.fields.map((field, index) => (
                    <div key={index} id={field.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <label 
                          htmlFor={field.id} 
                          className="block text-sm font-medium text-gray-700"
                        >
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {field.description && (
                          <span className="text-xs text-gray-500">
                            {field.description}
                          </span>
                        )}
                      </div>
                      
                      {getFieldInput(field)}
                      
                      {validationErrors[field.id] && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors[field.id]}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No fillable fields detected</h3>
                    <p className="text-gray-500">
                      This form doesn't have any detected fillable fields. 
                      You may need to open the original form to fill it.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex justify-between items-center">
            <button
              onClick={resetForm}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} className="mr-2" />
              Reset Form
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/form/${form.id}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <EyeIcon size={16} className="mr-2" />
                Preview
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                  ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
              >
                {isSaving ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save and Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Autofill</h2>
            </div>
            <div className="p-4">
              <AutofillProfileSelector
                profiles={profiles}
                selectedProfileId={selectedProfileId}
                onSelectProfile={handleProfileSelect}
                onCreateProfile={() => {}}
                onEditProfile={() => {}}
                onDeleteProfile={() => {}}
              />
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700">Field Completion</h3>
                <div className="mt-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-green-500"
                    style={{ 
                      width: `${Math.round(
                        (Object.keys(formValues).length / form.fields.length) * 100
                      )}%` 
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>
                    {Object.keys(formValues).length} of {form.fields.length} fields filled
                  </span>
                  <span>
                    {Math.round(
                      (Object.keys(formValues).length / form.fields.length) * 100
                    )}%
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">More Options</h3>
                <button className="w-full text-left flex items-center justify-between p-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 mb-2">
                  <span className="flex items-center">
                    <Download size={16} className="mr-2 text-gray-500" />
                    Download Blank Form
                  </span>
                </button>
                <button className="w-full text-left flex items-center justify-between p-3 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  <span className="flex items-center">
                    <Edit size={16} className="mr-2 text-gray-500" />
                    Edit as Template
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
            <div className="flex">
              <CheckCircle size={20} className="text-blue-500 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Use the autofill profiles on the right to quickly populate common fields. 
                    You can also create custom profiles for frequently used information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormFill;