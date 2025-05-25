import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Units from './pages/Units';
import Tenants from './pages/Tenants';
import TenantDetails from './pages/TenantDetails';
import UnitTenancies from './pages/UnitTenancies';
import Payments from './pages/Payments';
import Organizations from './pages/Organizations';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'manager';

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Routes accessible only to guests (non-authenticated users)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// Define routes
const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: 'properties',
        element: <ProtectedRoute><Properties /></ProtectedRoute>
      },
      {
        path: 'units',
        element: <ProtectedRoute><Units /></ProtectedRoute>
      },      {
        path: 'tenants',
        element: <ProtectedRoute><Tenants /></ProtectedRoute>
      },      {
        path: 'tenants/:id',
        element: <ProtectedRoute><TenantDetails /></ProtectedRoute>
      },
      {
        path: 'unit-tenancies',
        element: <ProtectedRoute><UnitTenancies /></ProtectedRoute>
      },
      {
        path: 'payments',
        element: <ProtectedRoute><Payments /></ProtectedRoute>
      },
      {
        path: 'organizations',
        element: <AdminRoute><Organizations /></AdminRoute>
      },
      {
        path: 'users',
        element: <AdminRoute><Users /></AdminRoute>
      }
    ]
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <GuestRoute><Login /></GuestRoute>
      },
      {
        path: 'register',
        element: <GuestRoute><Register /></GuestRoute>
      }
    ]
  },  {
    path: '*',
    element: <NotFound />
  }
];

export const router = createBrowserRouter(routes);