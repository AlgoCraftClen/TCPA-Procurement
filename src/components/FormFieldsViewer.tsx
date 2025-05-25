import React, { useState } from 'react';
import { Form, FormField } from '../types/Form';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FormFieldsViewerProps {
  form: Form;
}

const FormFieldsViewer: React.FC<FormFieldsViewerProps> = ({ form }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Personal Information': true,
    'Contact Details': true,
    'Address': true,
    'Payment Information': true,
    'Other': true
  });

  // Group fields by category
  const fieldsByCategory = form.fields.reduce((acc, field) => {
    const category = field.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {} as Record<string, FormField[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter fields based on search term
  const filteredCategories = Object.entries(fieldsByCategory).reduce((acc, [category, fields]) => {
    const filteredFields = fields.filter(field => 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredFields.length > 0) {
      acc[category] = filteredFields;
    }
    
    return acc;
  }, {} as Record<string, FormField[]>);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Form Fields</h3>
        <p className="text-sm text-gray-500">
          {form.fields.length} fields detected in this form
        </p>
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Search fields..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {Object.keys(filteredCategories).length > 0 ? (
          Object.entries(filteredCategories).map(([category, fields]) => (
            <div key={category} className="border-b border-gray-200 last:border-b-0">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <span className="font-medium text-gray-800">{category}</span>
                {expandedCategories[category] ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
              
              {expandedCategories[category] && (
                <ul className="divide-y divide-gray-200">
                  {fields.map((field) => (
                    <li key={field.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{field.label}</p>
                          <p className="text-xs text-gray-500">{field.id}</p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${field.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {field.required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          Type: <span className="font-medium">{field.type}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No fields match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormFieldsViewer;