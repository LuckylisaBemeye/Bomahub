import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600">BomaHub</h1>
        </Link>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          Property Management System
        </h2>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow-lg sm:rounded-lg border border-gray-200">
          <Outlet />
        </div>
        
        {/* Additional footer for auth pages */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure property management for modern businesses
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
