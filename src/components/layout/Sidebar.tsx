import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Don't show sidebar if user is not authenticated
  if (!isAuthenticated) return null;
  
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  
  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', visible: true },
    { name: 'Properties', path: '/properties', icon: '🏢', visible: true },
    { name: 'Units', path: '/units', icon: '🚪', visible: true },
    { name: 'Tenants', path: '/tenants', icon: '👥', visible: true },
    { name: 'Payments', path: '/payments', icon: '💰', visible: true },
    { name: 'Organizations', path: '/organizations', icon: '🏛️', visible: isAdmin },
    { name: 'Users', path: '/users', icon: '👤', visible: isAdmin },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:inset-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-900 lg:justify-center">
            <h2 className="text-lg font-semibold text-white truncate">
              Property Management
            </h2>
            {/* Close button for mobile */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => 
              item.visible && (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${location.pathname === item.path 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            )}
          </nav>
          
          {/* User info at bottom */}
          {user && (
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate capitalize">
                    {user.role?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;