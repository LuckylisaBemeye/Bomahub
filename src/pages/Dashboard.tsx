import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertiesService, unitsService, tenantsService,} from '../services/api';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalTenants: number;
}

interface ActivityItem {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  entityId?: number;
  entityType?: string;
}

// Mock data for recent activity only (since we don't have an API for this)
const mockRecentActivity: ActivityItem[] = [
  {
    id: 1,
    type: 'New Tenant',
    description: 'John Doe was added as a tenant',
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'Unit Update',
    description: 'Unit 202 at Skyline Apartments was marked as vacant',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'Maintenance Request',
    description: 'New maintenance request for Unit 104 - Plumbing issue',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    totalTenants: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>(mockRecentActivity);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch real data from existing APIs
        const [propertiesData, unitsData, tenantsData] = await Promise.all([
          propertiesService.getAll(),
          unitsService.getAll(),
          tenantsService.getAll()
        ]);        // Calculate stats from the fetched data
        const totalProperties = propertiesData.length;
        const totalUnits = unitsData.length;
        
        // Debug: Log unit statuses to understand what values we're getting
        console.log('Unit statuses:', unitsData.map((unit: any) => unit.status));
        
        const occupiedUnits = unitsData.filter((unit: any) => unit.status === 'occupied').length;
        const vacantUnits = unitsData.filter((unit: any) => unit.status === 'available').length;
        const maintenanceUnits = unitsData.filter((unit: any) => unit.status === 'maintenance').length;
        const totalTenants = tenantsData.length;
        
        console.log('Stats calculated:', {
          totalUnits,
          occupiedUnits,
          vacantUnits,
          maintenanceUnits,
          total: occupiedUnits + vacantUnits + maintenanceUnits
        });
        
        // Update the stats state with real data
        setStats({
          totalProperties,
          totalUnits,
          occupiedUnits,
          vacantUnits,
          totalTenants
        });
        
        // We'll keep using mock data for recent activity
        setRecentActivity(mockRecentActivity);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        console.error('Dashboard data error:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {user?.name || user?.username || 'User'}!
          {user?.role && <span className="ml-1 text-indigo-600">({user.role})</span>}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Properties Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Properties
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.totalProperties}
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/properties" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all properties
              </Link>
            </div>
          </div>
        </div>

        {/* Units Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Units
                </dt>
                <dd className="flex flex-col sm:flex-row sm:items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.totalUnits}
                  </div>
                  <div className="mt-1 sm:mt-0 sm:ml-2 flex flex-wrap items-baseline text-sm font-semibold">
                    <span className="text-green-600 mr-2">{stats.occupiedUnits} occupied</span>
                    <span className="text-red-600">{stats.vacantUnits} vacant</span>
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/units" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all units
              </Link>
            </div>
          </div>
        </div>

        {/* Tenants Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Tenants
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stats.totalTenants}
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/tenants" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all tenants
              </Link>
            </div>
          </div>
        </div>

        {/* Admin/Manager: Users Management Card */}
        {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'manager') && (
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5 flex items-center">
              <div className="flex-shrink-0 bg-indigo-700 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  User Management
                </dt>
                <dd>
                  <Link
                    to="/users"
                    className="mt-2 inline-block font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Go to Users Page
                  </Link>
                </dd>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 overflow-x-auto sm:overflow-visible">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentActivity.length === 0 ? (
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">No recent activity found.</p>
                </div>
              </li>
            ) : (
              recentActivity.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">{activity.type}</p>
                    <div className="mt-1 sm:mt-0 sm:ml-2 flex-shrink-0">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
