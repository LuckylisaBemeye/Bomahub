import { useState, useEffect } from 'react';
import { unitTenancyService, unitsService, tenantsService } from '../services/api';

interface Unit {
  id: number;
  unitNumber: string;
  propertyId: number;
  propertyName?: string;
  floorArea: number;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  isOccupied: boolean;
}

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface UnitTenancy {
  id: number;
  unitId: number;
  unit?: Unit;
  tenantId: number;
  tenant?: Tenant;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  securityDeposit: number;
  isActive: boolean;
  leaseDocument?: string;
}

const UnitTenancies = () => {
  const [unitTenancies, setUnitTenancies] = useState<UnitTenancy[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState<UnitTenancy | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    unitId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    securityDeposit: '',
    leaseDocument: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all required data in parallel
      const [tenanciesData, unitsData, tenantsData] = await Promise.all([
        unitTenancyService.getAll(),
        unitsService.getAll(),
        tenantsService.getAll()
      ]);
      
      // Enrich tenancies with unit and tenant details
      const enrichedTenancies = tenanciesData.map((tenancy: UnitTenancy) => {
        const unit = unitsData.find((u: Unit) => u.id === tenancy.unitId);
        const tenant = tenantsData.find((t: Tenant) => t.id === tenancy.tenantId);
        
        return {
          ...tenancy,
          unit,
          tenant
        };
      });
      
      setUnitTenancies(enrichedTenancies);
      setUnits(unitsData);
      setTenants(tenantsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      unitId: '',
      tenantId: '',
      startDate: '',
      endDate: '',
      monthlyRent: '',
      securityDeposit: '',
      leaseDocument: ''
    });
  };

  const handleAddTenancy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const tenancyData = {
        unitId: parseInt(formData.unitId),
        tenantId: parseInt(formData.tenantId),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
        leaseDocument: formData.leaseDocument || null
      };
      
      await unitTenancyService.create(tenancyData);
      fetchData(); // Refresh the data
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tenancy';
      setError(errorMessage);
      console.error('Error creating tenancy:', errorMessage);
    }
  };

  const handleEditTenancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenancy) return;
    
    setError(null);
    
    try {
      const tenancyData = {
        unitId: parseInt(formData.unitId),
        tenantId: parseInt(formData.tenantId),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
        leaseDocument: formData.leaseDocument || null
      };
      
      await unitTenancyService.update(selectedTenancy.id, tenancyData);
      fetchData(); // Refresh the data
      setShowEditModal(false);
      setSelectedTenancy(null);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tenancy';
      setError(errorMessage);
      console.error('Error updating tenancy:', errorMessage);
    }
  };

  const handleTerminateTenancy = async (tenancyId: number) => {
    if (window.confirm('Are you sure you want to terminate this tenancy?')) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await unitTenancyService.terminate(tenancyId, { endDate: today });
        fetchData(); // Refresh the data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to terminate tenancy';
        setError(errorMessage);
        console.error('Error terminating tenancy:', errorMessage);
      }
    }
  };

  const handleDeleteTenancy = async (tenancyId: number) => {
    if (window.confirm('Are you sure you want to delete this unit tenancy? This action cannot be undone.')) {
      try {
        await unitTenancyService.delete(tenancyId);
        fetchData(); // Refresh the data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete tenancy';
        setError(errorMessage);
        console.error('Error deleting tenancy:', errorMessage);
      }
    }
  };

  const openEditModal = (tenancy: UnitTenancy) => {
    setSelectedTenancy(tenancy);
    setFormData({
      unitId: tenancy.unitId.toString(),
      tenantId: tenancy.tenantId.toString(),
      startDate: tenancy.startDate,
      endDate: tenancy.endDate || '',
      monthlyRent: tenancy.monthlyRent.toString(),
      securityDeposit: tenancy.securityDeposit.toString(),
      leaseDocument: tenancy.leaseDocument || ''
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading unit tenancies...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Unit Tenancies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage tenancy agreements between units and tenants
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Tenancy
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
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
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {unitTenancies.map((tenancy) => (
            <li key={tenancy.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-indigo-600">
                      Unit {tenancy.unit?.unitNumber} - {tenancy.tenant?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Property: {tenancy.unit?.propertyName}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tenancy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tenancy.isActive ? 'Active' : 'Terminated'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex sm:flex-col">
                    <p className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-1">Start Date:</span> {new Date(tenancy.startDate).toLocaleDateString()}
                    </p>
                    {tenancy.endDate && (
                      <p className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="font-medium mr-1">End Date:</span> {new Date(tenancy.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 sm:flex sm:flex-col sm:items-end sm:mt-0">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Monthly Rent:</span> ${tenancy.monthlyRent.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="font-medium">Security Deposit:</span> ${tenancy.securityDeposit.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => openEditModal(tenancy)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  {tenancy.isActive && (
                    <button
                      onClick={() => handleTerminateTenancy(tenancy.id)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Terminate
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTenancy(tenancy.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
          {unitTenancies.length === 0 && (
            <li>
              <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No unit tenancies found.
              </div>
            </li>
          )}
        </ul>
      </div>      {/* Add Tenancy Modal */}
      {showAddModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div 
              className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Tenancy</h3>
                <form onSubmit={handleAddTenancy} className="mt-4">
                  <div className="grid grid-cols-1 gap-y-4">
                    <div>
                      <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">Unit</label>
                      <select
                        id="unitId"
                        name="unitId"
                        value={formData.unitId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select a unit</option>
                        {units.filter(unit => !unit.isOccupied).map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unitNumber} - {unit.propertyName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">Tenant</label>
                      <select
                        id="tenantId"
                        name="tenantId"
                        value={formData.tenantId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select a tenant</option>
                        {tenants.map(tenant => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.name} - {tenant.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700">Monthly Rent ($)</label>
                      <input
                        type="number"
                        id="monthlyRent"
                        name="monthlyRent"
                        value={formData.monthlyRent}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700">Security Deposit ($)</label>
                      <input
                        type="number"
                        id="securityDeposit"
                        name="securityDeposit"
                        value={formData.securityDeposit}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="leaseDocument" className="block text-sm font-medium text-gray-700">Lease Document URL (Optional)</label>
                      <input
                        type="text"
                        id="leaseDocument"
                        name="leaseDocument"
                        value={formData.leaseDocument}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Edit Tenancy Modal */}
      {showEditModal && selectedTenancy && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity"
              onClick={() => {
                setShowEditModal(false);
                setSelectedTenancy(null);
                resetForm();
              }}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div 
              className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Tenancy</h3>
                <form onSubmit={handleEditTenancy} className="mt-4">
                  <div className="grid grid-cols-1 gap-y-4">
                    <div>
                      <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">Unit</label>
                      <select
                        id="unitId"
                        name="unitId"
                        value={formData.unitId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select a unit</option>
                        {units
                          .filter(unit => !unit.isOccupied || unit.id === selectedTenancy.unitId)
                          .map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.unitNumber} - {unit.propertyName}
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    {/* Similar form fields as Add Modal */}
                    <div>
                      <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">Tenant</label>
                      <select
                        id="tenantId"
                        name="tenantId"
                        value={formData.tenantId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Select a tenant</option>
                        {tenants.map(tenant => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.name} - {tenant.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700">Monthly Rent ($)</label>
                      <input
                        type="number"
                        id="monthlyRent"
                        name="monthlyRent"
                        value={formData.monthlyRent}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700">Security Deposit ($)</label>
                      <input
                        type="number"
                        id="securityDeposit"
                        name="securityDeposit"
                        value={formData.securityDeposit}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="leaseDocument" className="block text-sm font-medium text-gray-700">Lease Document URL (Optional)</label>
                      <input
                        type="text"
                        id="leaseDocument"
                        name="leaseDocument"
                        value={formData.leaseDocument}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedTenancy(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitTenancies;