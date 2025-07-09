import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesService } from '../services/api';

interface Organization {
  id: number;
  name: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  description?: string;
  organization: Organization;
  city?: string;
  state?: string;
  zipCode?: string;
  type?: string;
  totalUnits?: number;
  occupiedUnits?: number;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  // const [organizations, setOrganizations] = useState<Organization[]>([]); // Removed - not needed for new API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false); // Disabled for new API
  // const [selectedProperty, setSelectedProperty] = useState<Property | null>(null); // Disabled for new API
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: '',
    propertyAddress: '',
    floorCount: 1,
    unitsPerFloor: 1,
    defaultRent: 0,
    startFloor: 1,
    customFloorUnits: 0,
    customFloorRent: 0
  });// Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {        
        // Fetch properties - backend should filter by user's organization automatically
        const propertiesData = await propertiesService.getAll();
          console.log('Fetched properties:', propertiesData);
        
        setProperties(propertiesData || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        console.error('Data fetch error:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
    // Add keyboard event listeners for modal handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddModal) {
          setShowAddModal(false);
          resetForm();
        }
        // Edit modal functionality disabled for new API
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };  }, [showAddModal]); // Removed showEditModal from dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['floorCount', 'unitsPerFloor', 'defaultRent', 'startFloor', 'customFloorUnits', 'customFloorRent'].includes(name) 
        ? Number(value) : value
    });
  };const resetForm = () => {
    setFormData({
      propertyName: '',
      propertyAddress: '',
      floorCount: 1,
      unitsPerFloor: 1,
      defaultRent: 0,
      startFloor: 1,
      customFloorUnits: 0,
      customFloorRent: 0
    });
  };
  
  // Helper function to show success messages and automatically clear them
  const showSuccessMessage = (message: string) => {
    // Clear any existing success message
    setSuccessMessage(null);
    // Set new message
    setTimeout(() => {
      setSuccessMessage(message);
      // Auto-clear after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 100);
  };  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    
    try {
      // Send form data directly as it matches the new API structure
      await propertiesService.create(formData);
      
      // Refresh properties list
      const data = await propertiesService.getAll();
      setProperties(data);
      setShowAddModal(false);
      resetForm();
      showSuccessMessage('Property added successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add property';
      setError(errorMessage);
      console.error('Add property error:', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };// Disabled edit functionality for new API structure
  /*
  const handleEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    
    try {
      // Note: Edit functionality may need to be implemented differently for new API
      // For now, we'll disable edit functionality until the API supports it
      setError('Edit functionality is not yet supported with the new API structure');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property';
      setError(errorMessage);
      console.error('Update property error:', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  */

  const handleDeleteProperty = async (propertyId: number) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      setError(null);
      setSuccessMessage(null);
      // No setSubmitting(true) here as it's not a form submission with a dedicated button
      
      try {
        await propertiesService.delete(propertyId);
          // Refresh properties list
        const data = await propertiesService.getAll();
        setProperties(data);
        showSuccessMessage('Property deleted successfully!');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete property';
        setError(errorMessage);
        console.error('Delete property error:', errorMessage);
      }
    }  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {successMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-right">
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-lg" role="alert">
            <p className="font-bold">Success</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all properties including their details and associated organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Property
          </button>
        </div>
      </div>
      
      {/* Properties List */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Address</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">Type</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">Units</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6">
                      <Link to={`/properties/${property.id}`}>
                        {property.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {property.address}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell capitalize">
                      {property.type || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {property.totalUnits !== undefined ? (
                        <>
                          <span className="font-medium">{property.totalUnits}</span>
                          {property.occupiedUnits !== undefined && (
                            <span className="text-xs ml-1">
                              ({property.occupiedUnits} occupied)
                            </span>
                          )}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            {/* Modal content */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add New Property</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
              <form onSubmit={handleAddProperty}>
              <div className="mb-4">
                <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700">Property Name</label>
                <input
                  type="text"
                  name="propertyName"
                  id="propertyName"
                  value={formData.propertyName}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">Property Address</label>
                <input
                  type="text"
                  name="propertyAddress"
                  id="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="floorCount" className="block text-sm font-medium text-gray-700">Number of Floors</label>
                  <input
                    type="number"
                    name="floorCount"
                    id="floorCount"
                    value={formData.floorCount}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="unitsPerFloor" className="block text-sm font-medium text-gray-700">Units Per Floor</label>
                  <input
                    type="number"
                    name="unitsPerFloor"
                    id="unitsPerFloor"
                    value={formData.unitsPerFloor}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="defaultRent" className="block text-sm font-medium text-gray-700">Default Rent ($)</label>
                  <input
                    type="number"
                    name="defaultRent"
                    id="defaultRent"
                    value={formData.defaultRent}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="startFloor" className="block text-sm font-medium text-gray-700">Starting Floor Number</label>
                  <input
                    type="number"
                    name="startFloor"
                    id="startFloor"
                    value={formData.startFloor}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="customFloorUnits" className="block text-sm font-medium text-gray-700">Custom Floor Units (Optional)</label>
                  <input
                    type="number"
                    name="customFloorUnits"
                    id="customFloorUnits"
                    value={formData.customFloorUnits}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="customFloorRent" className="block text-sm font-medium text-gray-700">Custom Floor Rent ($) (Optional)</label>
                  <input
                    type="number"
                    name="customFloorRent"
                    id="customFloorRent"
                    value={formData.customFloorRent}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* Edit Property Modal - Disabled for new API structure
      {showEditModal && selectedProperty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Edit Property</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProperty(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditProperty}>
              Edit functionality temporarily disabled for new API structure
            </form>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default Properties;
