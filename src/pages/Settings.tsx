import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Clock, 
  Settings as SettingsIcon, 
  Edit,
  Trash,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Database,
  Cloud,
  FolderOpen
} from 'lucide-react';
import { useFormContext } from '../hooks/useFormContext';
import { AutofillProfile } from '../types/AutofillProfile';

const Settings: React.FC = () => {
  const { profiles } = useFormContext();
  const [activeTab, setActiveTab] = useState<'profiles' | 'sources' | 'preferences'>('profiles');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profiles: true,
    sources: true,
    preferences: true
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center
                ${activeTab === 'profiles' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <User size={16} className="mr-2" />
              Autofill Profiles
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center
                ${activeTab === 'sources' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FolderOpen size={16} className="mr-2" />
              Form Sources
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center
                ${activeTab === 'preferences' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <SettingsIcon size={16} className="mr-2" />
              Preferences
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'profiles' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Autofill Profiles</h2>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus size={16} className="mr-2" />
                  New Profile
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('profiles')}
                >
                  <h3 className="text-sm font-medium text-gray-900 flex items-center">
                    <User size={16} className="mr-2 text-blue-600" />
                    Personal Profiles
                  </h3>
                  {expandedSections.profiles ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
                
                {expandedSections.profiles && (
                  <div className="divide-y divide-gray-200">
                    {profiles
                      .filter((profile: AutofillProfile) => profile.type === 'personal')
                      .map((profile: AutofillProfile) => (
                        <div key={profile.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <User size={18} className="text-blue-600 mt-0.5" />
                              <div className="ml-3">
                                <h4 className="text-sm font-medium text-gray-900">{profile.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {profile.description || `${profile.fields.length} fields available`}
                                </p>
                                <div className="mt-2 flex items-center text-xs text-gray-500">
                                  <Clock size={12} className="mr-1" />
                                  Last updated: {profile.lastUpdated || 'Never'}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection('company')}
                >
                  <h3 className="text-sm font-medium text-gray-900 flex items-center">
                    <Building size={16} className="mr-2 text-green-600" />
                    Company Profiles
                  </h3>
                  {expandedSections.company ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
                
                {expandedSections.company && (
                  <div className="divide-y divide-gray-200">
                    {profiles
                      .filter((profile: AutofillProfile) => profile.type === 'company')
                      .map((profile: AutofillProfile) => (
                        <div key={profile.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <Building size={18} className="text-green-600 mt-0.5" />
                              <div className="ml-3">
                                <h4 className="text-sm font-medium text-gray-900">{profile.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {profile.description || `${profile.fields.length} fields available`}
                                </p>
                                <div className="mt-2 flex items-center text-xs text-gray-500">
                                  <Clock size={12} className="mr-1" />
                                  Last updated: {profile.lastUpdated || 'Never'}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'sources' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Form Sources</h2>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus size={16} className="mr-2" />
                  Add Source
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      <FolderOpen size={16} className="mr-2 text-orange-600" />
                      Local Folders
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Edit size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-4">
                      Scan local folders on your computer for forms.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                      <p className="text-sm text-gray-700">C:\Users\Documents\Forms</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <p className="text-sm text-gray-700">C:\Users\Downloads</p>
                    </div>
                    <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <Plus size={14} className="mr-1" />
                      Add Folder
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      <Cloud size={16} className="mr-2 text-blue-600" />
                      Cloud Storage
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Edit size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-4">
                      Connect to cloud storage to access forms stored online.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-blue-600">G</span>
                        </div>
                        <span className="text-sm text-gray-700">Google Drive</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    </div>
                    
                    <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <Plus size={14} className="mr-1" />
                      Connect Storage
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      <FileText size={16} className="mr-2 text-purple-600" />
                      SharePoint
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Edit size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-4">
                      Connect to SharePoint to access company forms.
                    </p>
                    <div className="flex justify-center items-center py-6 border border-dashed border-gray-300 rounded-md">
                      <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        <Plus size={14} className="mr-1" />
                        Connect to SharePoint
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      <Database size={16} className="mr-2 text-teal-600" />
                      Database
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Edit size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-4">
                      Connect to databases storing form templates.
                    </p>
                    <div className="flex justify-center items-center py-6 border border-dashed border-gray-300 rounded-md">
                      <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        <Plus size={14} className="mr-1" />
                        Add Database Connection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">Preferences</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('preferences')}
                  >
                    <h3 className="text-sm font-medium text-gray-900">General</h3>
                    {expandedSections.preferences ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </div>
                  
                  {expandedSections.preferences && (
                    <div className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="rounded text-blue-600 focus:ring-blue-500 mr-2" 
                              defaultChecked 
                            />
                            <span className="text-sm text-gray-700">Show recent forms on dashboard</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="rounded text-blue-600 focus:ring-blue-500 mr-2" 
                              defaultChecked 
                            />
                            <span className="text-sm text-gray-700">Auto-detect fillable fields in PDF forms</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="rounded text-blue-600 focus:ring-blue-500 mr-2" 
                              defaultChecked 
                            />
                            <span className="text-sm text-gray-700">Use OCR for scanned documents</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default export format
                          </label>
                          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option>Same as original</option>
                            <option>Always PDF</option>
                            <option>Always XLSX</option>
                            <option>Always DOCX</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('ocr')}
                  >
                    <h3 className="text-sm font-medium text-gray-900">OCR Settings</h3>
                    {expandedSections.ocr ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </div>
                  
                  {expandedSections.ocr && (
                    <div className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            OCR Engine
                          </label>
                          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option>Tesseract (Built-in)</option>
                            <option>Azure Form Recognizer</option>
                            <option>Google Vision API</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language
                          </label>
                          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="rounded text-blue-600 focus:ring-blue-500 mr-2" 
                              defaultChecked 
                            />
                            <span className="text-sm text-gray-700">Auto-detect form fields after OCR</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection('backup')}
                  >
                    <h3 className="text-sm font-medium text-gray-900">Backup & Storage</h3>
                    {expandedSections.backup ? (
                      <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500" />
                    )}
                  </div>
                  
                  {expandedSections.backup && (
                    <div className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Save filled forms to
                          </label>
                          <input 
                            type="text" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            defaultValue="C:\Users\Documents\Filled Forms"
                          />
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="rounded text-blue-600 focus:ring-blue-500 mr-2" 
                              defaultChecked 
                            />
                            <span className="text-sm text-gray-700">Keep backup of original forms</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="rounded text-blue-600 focus:ring-blue-500 mr-2" 
                              defaultChecked 
                            />
                            <span className="text-sm text-gray-700">Organize filled forms by date</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Storage limit for form cache
                          </label>
                          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option>1 GB</option>
                            <option>2 GB</option>
                            <option>5 GB</option>
                            <option>No Limit</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;