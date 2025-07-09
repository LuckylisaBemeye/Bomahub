import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { unitsService, unitTenancyService, floorsService } from "../services/api";
import type { Unit as APIUnit, UnitTenancy } from "../types/api";
import Alert from "../components/common/Alert";

interface DisplayUnit {
  id: number;
  unitNumber: string;
  propertyId: number;
  propertyName: string;
  floorId: number;
  floorName: string;
  status: "occupied" | "vacant" | "maintenance";
  squareFeet?: number;
  currentTenant?: {
    name: string;
    tenantId: number;
    startDate: string;
    endDate?: string | null;
  };
}

interface FloorGroup {
  floorId: number;
  floorName: string;
  propertyName: string;
  units: DisplayUnit[];
}

const Units = () => {
  const [floorGroups, setFloorGroups] = useState<FloorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<DisplayUnit | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    unitNumber: "",
    propertyId: "",
    floorId: "",
    squareFeet: "",
  });  // Additional data for dropdowns - for future use
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);  // This state will be used when implementing floor selection
  const [_floors, setFloors] = useState<any[]>([]);  const fetchUnits = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch units from API - backend should filter by user's organization
      const unitsData: APIUnit[] = await unitsService.getAll();
      
      // Fetch all unit tenancies to get current tenant info
      const allTenancies: UnitTenancy[] = await unitTenancyService.getAll();

      // For each unit, find the active tenancy to get the current tenant
      const unitsWithTenants: DisplayUnit[] = unitsData.map((unit) => {
        const activeTenancy = allTenancies.find(
          (t) => t.unit.id === unit.id && t.status === 'active'
        );

        return {
          id: unit.id,
          unitNumber: unit.unitNumber,
          propertyId: unit.property?.id || 0,
          propertyName: unit.property?.name || "Unknown Property",
          floorId: unit.floor?.id || 0,
          floorName: unit.floor?.name || "Unknown Floor",
          status: unit.status === 'available' ? 'vacant' : 
                 unit.status === 'occupied' ? 'occupied' : 'maintenance',
          squareFeet: undefined, // Not in Unit interface, would need separate call if needed
          currentTenant: activeTenancy ? {
            name: `${activeTenancy.tenant.firstName || ''} ${activeTenancy.tenant.lastName || ''}`.trim() || 'Unknown',
            tenantId: activeTenancy.tenant.id,
            startDate: activeTenancy.startDate,
            endDate: activeTenancy.endDate
          } : undefined,        };
      });

      // Group units by floor
      const grouped = unitsWithTenants.reduce((acc: FloorGroup[], unit) => {
        const existingFloor = acc.find(group => group.floorId === unit.floorId);
        
        if (existingFloor) {
          existingFloor.units.push(unit);
        } else {
          acc.push({
            floorId: unit.floorId,
            floorName: unit.floorName,
            propertyName: unit.propertyName,
            units: [unit]
          });
        }
        
        return acc;
      }, []);

      // Sort floor groups by floor name/number
      grouped.sort((a, b) => {
        // Try to parse as numbers first, then fall back to string comparison
        const aNum = parseInt(a.floorName);
        const bNum = parseInt(b.floorName);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        return a.floorName.localeCompare(b.floorName);
      });

      // Sort units within each floor by unit number
      grouped.forEach(floor => {
        floor.units.sort((a, b) => {
          const aNum = parseInt(a.unitNumber);
          const bNum = parseInt(b.unitNumber);
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          
          return a.unitNumber.localeCompare(b.unitNumber);
        });
      });

      setFloorGroups(grouped);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load units";
      setError(errorMessage);
      console.error("Units error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUnits();
  }, []);

  // Fetch floors when property is selected
  useEffect(() => {
    const fetchFloors = async () => {
      if (selectedPropertyId) {
        try {
          const floorsData = await floorsService.getByProperty(selectedPropertyId);
          setFloors(floorsData);
        } catch (err) {
          console.error("Error fetching floors:", err);
          setFloors([]);
        }
      } else {
        setFloors([]);
      }
    };

    fetchFloors();
  }, [selectedPropertyId]);
  const resetForm = () => {
    setFormData({
      unitNumber: "",
      propertyId: "",
      floorId: "",
      squareFeet: "",
    });
    setSelectedPropertyId(null);
    setFloors([]);
  };
  // These functions would be implemented when the form is actually used
  // They are kept here as comments for future reference
  /*
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = parseInt(e.target.value);
    setSelectedPropertyId(propertyId || null);
    setFormData((prev) => ({
      ...prev,
      propertyId: e.target.value,
      floorId: "", // Reset floor when property changes
    }));
  };
  */

  const handleAddUnit = () => {
    resetForm();
    setEditingUnit(null);
    setShowAddModal(true);
  };  const handleEditUnit = (unit: DisplayUnit) => {
    setFormData({
      unitNumber: unit.unitNumber,
      propertyId: unit.propertyId.toString(),
      floorId: unit.floorId.toString(), // Now we have the floor ID from the unit data
      squareFeet: unit.squareFeet?.toString() || "",
    });
    setSelectedPropertyId(unit.propertyId);
    setEditingUnit(unit);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingUnit(null);
    resetForm();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const unitData = {
        unitNumber: formData.unitNumber,
        propertyId: parseInt(formData.propertyId),
        floorId: formData.floorId ? parseInt(formData.floorId) : undefined,
        squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
      };

      if (editingUnit) {
        // Update existing unit
        await unitsService.update(editingUnit.id, unitData);
        setSuccessMessage("Unit updated successfully");
      } else {
        // Create new unit
        await unitsService.create(unitData);
        setSuccessMessage("Unit created successfully");
      }

      handleCloseModal();
      fetchUnits(); // Refresh the units list

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save unit";
      setError(errorMessage);
      console.error("Save unit error:", errorMessage);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-green-100 text-green-800";
      case "vacant":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      {successMessage && <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Units by Floor</h1>
          <p className="mt-2 text-sm text-gray-700">
            Rental units organized by floor across all your properties including their details and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddUnit}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Unit
          </button>
        </div>
      </div>{/* Units Grouped by Floor */}
      <div className="space-y-8">
        {floorGroups.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No units found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new unit.</p>
            <div className="mt-6">
              <button
                onClick={handleAddUnit}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Unit
              </button>
            </div>
          </div>
        ) : (
          floorGroups.map((floor) => (
            <div key={floor.floorId} className="bg-white shadow-sm rounded-lg border border-gray-200">
              {/* Floor Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Floor {floor.floorName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {floor.propertyName} • {floor.units.length} unit{floor.units.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600 font-medium">
                      {floor.units.filter(u => u.status === 'occupied').length} Occupied
                    </span>
                    <span className="text-yellow-600 font-medium">
                      {floor.units.filter(u => u.status === 'vacant').length} Vacant
                    </span>
                    <span className="text-red-600 font-medium">
                      {floor.units.filter(u => u.status === 'maintenance').length} Maintenance
                    </span>
                  </div>
                </div>
              </div>

              {/* Units Grid for this Floor */}
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {floor.units.map((unit) => (
                    <div key={unit.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <Link 
                          to={`/units/${unit.id}`} 
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          Unit {unit.unitNumber}
                        </Link>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(
                            unit.status
                          )}`}
                        >
                          {unit.status}
                        </span>
                      </div>

                      {unit.currentTenant ? (
                        <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 h-3 w-3 text-green-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <Link 
                                to={`/tenants/${unit.currentTenant.tenantId}`}
                                className="text-xs font-medium text-green-800 hover:underline truncate block"
                              >
                                {unit.currentTenant.name}
                              </Link>
                              <p className="text-xs text-green-600">
                                Since {new Date(unit.currentTenant.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 h-3 w-3 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                            <p className="text-xs text-gray-500">No current tenant</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleEditUnit(unit)} 
                          className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Unit Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center p-2 sm:p-8">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button 
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 mt-2">
              <h3 className="text-lg font-medium text-gray-900">Add New Unit</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form content */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center p-2 sm:p-8">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button 
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 mt-2">
              <h3 className="text-lg font-medium text-gray-900">Edit Unit {editingUnit?.unitNumber}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form content */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
