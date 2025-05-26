import React from 'react';
import { ExtractedField } from '../types/Form';

type DocumentPreviewProps = {
  fields: ExtractedField[];
  onFieldChange?: (fieldName: string, value: string) => void;
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ fields, onFieldChange }) => {
  const groupedFields = fields.reduce<Record<string, ExtractedField[]>>((acc, field) => {
    const section = field.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedFields).map(([section, sectionFields]) => (
        <div key={section} className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">{section}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionFields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.name}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                {renderFieldInput(field, onFieldChange)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

function renderFieldInput(field: ExtractedField, onChange?: (name: string, value: string) => void) {
  switch (field.type) {
    case 'checkbox':
      return (
        <input
          type="checkbox"
          defaultChecked={field.defaultValue === 'true'}
          onChange={(e) => onChange?.(field.name, e.target.checked.toString())}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      );
    case 'select':
      return (
        <select
          defaultValue={field.defaultValue}
          onChange={(e) => onChange?.(field.name, e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    default:
      return (
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          defaultValue={field.defaultValue}
          onChange={(e) => onChange?.(field.name, e.target.value)}
          className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
        />
      );
  }
}
