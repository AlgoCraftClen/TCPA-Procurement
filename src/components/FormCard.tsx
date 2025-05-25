import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  File, 
  FileSpreadsheet, 
  FileText, 
  Star, 
  Clock, 
  Tag,
  MoreVertical
} from 'lucide-react';
import { Form } from '../types/Form';

interface FormCardProps {
  form: Form;
}

const FormCard: React.FC<FormCardProps> = ({ form }) => {
  const navigate = useNavigate();
  
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

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
      onClick={() => navigate(`/form/${form.id}`)}
    >
      <div className="relative h-36 bg-gray-100 flex items-center justify-center">
        {form.thumbnail ? (
          <img 
            src={form.thumbnail} 
            alt={form.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            {getFormIcon()}
            <span className="mt-2 text-xs text-gray-500">{form.type.toUpperCase()}</span>
          </div>
        )}
        
        {form.isFavorite && (
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 line-clamp-1">{form.name}</h3>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <MoreVertical size={16} />
          </button>
        </div>
        
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <Clock size={14} className="mr-1" />
          <span>{form.lastModified}</span>
        </div>
        
        {form.tags && form.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {form.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <Tag size={12} className="mr-1" />
                {tag}
              </span>
            ))}
            {form.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{form.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormCard;