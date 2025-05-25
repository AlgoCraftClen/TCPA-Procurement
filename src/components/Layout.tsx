import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  ChevronRight,
  Search,
  Plus,
  MessageSquare
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 
      'bg-blue-100 text-blue-700' : 
      'text-gray-700 hover:bg-gray-100';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewForm = () => {
    // Open modal or navigate to form creation
    navigate('/forms/new');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed z-20 top-4 left-4 md:hidden">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-600"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform md:translate-x-0 transition duration-300 ease-in-out z-10
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 bg-white border-r border-gray-200 shadow-sm`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-800">FormFlow</h1>
          </div>
          <div className="mt-8 space-y-1">
            <button 
              onClick={handleNewForm}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Plus size={18} />
                <span>New Form</span>
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search forms..." 
              className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${isActive('/')}`}
          >
            <LayoutGrid size={20} className="mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/library')}
            className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${isActive('/library')}`}
          >
            <FileText size={20} className="mr-3" />
            Forms Library
          </button>
          <button 
            onClick={() => navigate('/messages')}
            className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${isActive('/messages')}`}
          >
            <MessageSquare size={20} className="mr-3" />
            Messages
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${isActive('/settings')}`}
          >
            <Settings size={20} className="mr-3" />
            Settings
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;