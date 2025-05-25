import React, { useState } from 'react';
import { PlusCircle, User, Building, Edit, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import { AutofillProfile } from '../types/AutofillProfile';

interface AutofillProfileSelectorProps {
  profiles: AutofillProfile[];
  selectedProfileId: string | null;
  onSelectProfile: (profileId: string | null) => void;
  onCreateProfile: () => void;
  onEditProfile: (profileId: string) => void;
  onDeleteProfile: (profileId: string) => void;
}

const AutofillProfileSelector: React.FC<AutofillProfileSelectorProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onCreateProfile,
  onEditProfile,
  onDeleteProfile
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const selectedProfile = selectedProfileId 
    ? profiles.find(p => p.id === selectedProfileId) 
    : null;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Autofill Profile
      </label>
      
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onClick={toggleDropdown}
      >
        {selectedProfile ? (
          <div className="flex items-center">
            {selectedProfile.type === 'personal' ? (
              <User size={18} className="mr-2 text-blue-500" />
            ) : (
              <Building size={18} className="mr-2 text-green-500" />
            )}
            <span className="text-gray-900">{selectedProfile.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">Select a profile</span>
        )}
        
        {isOpen ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
          <ul className="py-1">
            {profiles.length > 0 ? (
              <>
                {profiles.map((profile) => (
                  <li 
                    key={profile.id}
                    className={`relative cursor-pointer select-none hover:bg-gray-50
                      ${selectedProfileId === profile.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <button 
                        onClick={() => {
                          onSelectProfile(profile.id);
                          setIsOpen(false);
                        }}
                        className="flex items-center w-full mr-8 text-left"
                      >
                        {profile.type === 'personal' ? (
                          <User size={18} className="mr-2 text-blue-500 flex-shrink-0" />
                        ) : (
                          <Building size={18} className="mr-2 text-green-500 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {profile.description || 
                              `${profile.fields.length} fields available for autofill`}
                          </div>
                        </div>
                      </button>
                      
                      <div className="flex items-center">
                        <button
                          onClick={() => onEditProfile(profile.id)}
                          className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteProfile(profile.id)}
                          className="p-1 ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </>
            ) : (
              <li className="px-4 py-3 text-sm text-gray-500">
                No profiles available
              </li>
            )}
            
            <li className="border-t border-gray-200">
              <button
                onClick={onCreateProfile}
                className="flex items-center w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"
              >
                <PlusCircle size={18} className="mr-2" />
                Create New Profile
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AutofillProfileSelector;