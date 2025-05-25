import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, Clock, Star, AlignLeft } from 'lucide-react';
import FormCard from '../components/FormCard';
import { useFormContext } from '../hooks/useFormContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { forms } = useFormContext();
  
  const recentForms = forms.slice(0, 4);
  const favoriteForms = forms.filter(form => form.isFavorite).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and fill your forms</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/form/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="mr-2" size={18} />
            New Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Quick Actions */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => navigate('/form/new')}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-3">
                <PlusCircle size={24} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center">Add New Form</h3>
              <p className="text-xs text-gray-500 text-center mt-1">Upload or import a form</p>
            </div>
            <div 
              className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => navigate('/library')}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full mb-3">
                <AlignLeft size={24} className="text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center">Browse Library</h3>
              <p className="text-xs text-gray-500 text-center mt-1">View all your forms</p>
            </div>
            <div 
              className="flex flex-col items-center justify-center p-6 bg-teal-50 rounded-lg border border-teal-100 cursor-pointer hover:bg-teal-100 transition-colors"
              onClick={() => navigate('/settings')}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-teal-100 rounded-full mb-3">
                <Star size={24} className="text-teal-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center">Manage Profiles</h3>
              <p className="text-xs text-gray-500 text-center mt-1">Setup autofill data</p>
            </div>
          </div>
        </section>

        {/* Recent Forms */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <Clock size={18} className="text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Recent Forms</h2>
            </div>
            <button 
              onClick={() => navigate('/library')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-6">
            {recentForms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentForms.map(form => (
                  <FormCard key={form.id} form={form} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No recent forms. Add a form to get started.</p>
                <button
                  onClick={() => navigate('/form/new')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                >
                  <PlusCircle className="mr-2" size={18} />
                  Add Form
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Favorite Forms */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <Star size={18} className="text-yellow-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Favorite Forms</h2>
            </div>
            <button 
              onClick={() => navigate('/library?filter=favorites')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-6">
            {favoriteForms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {favoriteForms.map(form => (
                  <FormCard key={form.id} form={form} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No favorite forms yet. Mark forms as favorite to see them here.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;