import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Folder,
  Star,
  Clock,
  Tag,
  X,
  File,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import FormCard from '../components/FormCard';
import FormUploader from '../components/FormUploader';
import { useFormContext } from '../hooks/useFormContext';

const FormsLibrary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { forms } = useFormContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>(searchParams.get('filter') || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get all unique tags from forms
  const allTags = Array.from(
    new Set(forms.flatMap(form => form.tags || []))
  );
  
  // Filter forms based on criteria
  const filteredForms = forms
    .filter(form => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          form.name.toLowerCase().includes(searchLower) ||
          (form.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter(form => {
      // Filter by type
      if (selectedType.length > 0) {
        return selectedType.includes(form.type);
      }
      return true;
    })
    .filter(form => {
      // Filter by tags
      if (selectedTags.length > 0) {
        return selectedTags.some(tag => form.tags?.includes(tag));
      }
      return true;
    })
    .filter(form => {
      // Filter by active filter
      if (activeFilter === 'favorites') {
        return form.isFavorite;
      }
      return true;
    });
  
  // Sort forms
  const sortedForms = [...filteredForms].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      // Assuming lastModified is in a format that can be compared
      return sortOrder === 'asc'
        ? a.lastModified.localeCompare(b.lastModified)
        : b.lastModified.localeCompare(a.lastModified);
    }
  });
  
  const toggleSort = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };
  
  const toggleTypeFilter = (type: string) => {
    setSelectedType(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const clearFilters = () => {
    setSelectedType([]);
    setSelectedTags([]);
    setActiveFilter('all');
    setSearchTerm('');
  };
  
  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter !== 'all') {
      params.set('filter', activeFilter);
    }
    
    const newUrl = 
      location.pathname + (params.toString() ? `?${params.toString()}` : '');
    
    navigate(newUrl, { replace: true });
  }, [activeFilter, navigate, location.pathname]);
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms Library</h1>
          <p className="text-gray-600 mt-1">Manage and organize your forms</p>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="mr-2" size={18} />
            Add Form
          </button>
        </div>
      </div>
      
      {showUploader && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upload New Forms</h2>
            <button
              onClick={() => setShowUploader(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
          <FormUploader />
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search forms..."
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              {searchTerm && (
                <button
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  className="flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  <Filter size={18} className="mr-2 text-gray-500" />
                  Filter
                </button>
                
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">Filter by Type</h3>
                    <div className="mt-2 space-y-1">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                          checked={selectedType.includes('pdf')}
                          onChange={() => toggleTypeFilter('pdf')}
                        />
                        <File size={16} className="mr-1 text-red-500" />
                        PDF
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                          checked={selectedType.includes('xlsx')}
                          onChange={() => toggleTypeFilter('xlsx')}
                        />
                        <FileSpreadsheet size={16} className="mr-1 text-green-600" />
                        Excel
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                          checked={selectedType.includes('docx')}
                          onChange={() => toggleTypeFilter('docx')}
                        />
                        <FileText size={16} className="mr-1 text-blue-600" />
                        Word
                      </label>
                    </div>
                  </div>
                  
                  {allTags.length > 0 && (
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900">Filter by Tags</h3>
                      <div className="mt-2 space-y-1">
                        {allTags.map((tag, index) => (
                          <label key={index} className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                              checked={selectedTags.includes(tag)}
                              onChange={() => toggleTagFilter(tag)}
                            />
                            {tag}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 border-t border-gray-200 flex justify-end">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={clearFilters}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                className="flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  if (sortBy === 'date') {
                    toggleSort();
                  } else {
                    setSortBy('date');
                  }
                }}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc size={18} className="mr-2 text-gray-500" />
                ) : (
                  <SortDesc size={18} className="mr-2 text-gray-500" />
                )}
                Date
              </button>
              
              <button
                className="flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  if (sortBy === 'name') {
                    toggleSort();
                  } else {
                    setSortBy('name');
                  }
                }}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc size={18} className="mr-2 text-gray-500" />
                ) : (
                  <SortDesc size={18} className="mr-2 text-gray-500" />
                )}
                Name
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors
                ${activeFilter === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('all')}
            >
              <Folder size={16} className="mr-1" />
              All Forms
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors
                ${activeFilter === 'favorites' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('favorites')}
            >
              <Star size={16} className="mr-1" />
              Favorites
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors
                ${activeFilter === 'recent' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveFilter('recent')}
            >
              <Clock size={16} className="mr-1" />
              Recent
            </button>
            
            {selectedType.length > 0 && (
              <div className="flex gap-1">
                {selectedType.map((type, index) => (
                  <span
                    key={`type-${index}`}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center"
                  >
                    {type === 'pdf' && <File size={14} className="mr-1" />}
                    {type === 'xlsx' && <FileSpreadsheet size={14} className="mr-1" />}
                    {type === 'docx' && <FileText size={14} className="mr-1" />}
                    {type.toUpperCase()}
                    <button
                      className="ml-1 text-blue-800 hover:text-blue-900"
                      onClick={() => toggleTypeFilter(type)}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {selectedTags.length > 0 && (
              <div className="flex gap-1">
                {selectedTags.map((tag, index) => (
                  <span
                    key={`tag-${index}`}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center"
                  >
                    <Tag size={14} className="mr-1" />
                    {tag}
                    <button
                      className="ml-1 text-green-800 hover:text-green-900"
                      onClick={() => toggleTagFilter(tag)}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {(selectedType.length > 0 || selectedTags.length > 0) && (
              <button
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {sortedForms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedForms.map(form => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No forms found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedType.length > 0 || selectedTags.length > 0
                  ? "No forms match your search criteria. Try adjusting your filters."
                  : "Add forms to your library to get started."}
              </p>
              <button
                onClick={() => setShowUploader(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="mr-2" size={18} />
                Add Form
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormsLibrary;