import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { unitTenancyService, unitsService, propertiesService } from "../services/api";
import type { 
  UnitTenancy, 
  Property,
  Unit
} from "../types/api";
import Alert from "../components/common/Alert";

// Interface for grouped tenant data
interface GroupedTenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  units: Array<{
    unitId: number;
    unitNumber: string;
    propertyId: number;
    propertyName: string;
    rentAmount: number;
    status: 'active' | 'inactive' | 'late';
    leaseStartDate: string;
    leaseEndDate: string;
  }>;
  totalRent: number;
  status: 'active' | 'inactive' | 'late';
}

const Tenants = () => {
  const [groupedTenants, setGroupedTenants] = useState<GroupedTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [showCreateTenancyModal, setShowCreateTenancyModal] = useState(false);

  // Complete tenancy form state
  const [tenancyFormData, setTenancyFormData] = useState({
    propertyId: "",
    unitIds: [] as string[],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idNumber: "",
    emergencyContact: "",
    monthlyRent: "",
    startDate: "",
  });

  // Additional data for complete tenancy creation
  const [properties, setProperties] = useState<Property[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching unit tenancies...');
        // Fetch unit tenancies which contain all tenant relationship data
        const tenanciesData: UnitTenancy[] = await unitTenancyService.getAll();
        console.log('Unit tenancies data received:', tenanciesData);

        // Group tenants by tenant ID to avoid duplicates
        const tenantGroups = new Map<number, GroupedTenant>();

        tenanciesData.forEach(tenancy => {
          const tenantId = tenancy.tenant.id;
          const nameParts = tenancy.tenant.name ? tenancy.tenant.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          if (!tenantGroups.has(tenantId)) {
            tenantGroups.set(tenantId, {
              id: tenantId,
              firstName,
              lastName,
              email: tenancy.tenant.email,
              phone: tenancy.tenant.phone,
              units: [],
              totalRent: 0,
              status: 'active'
            });
          }

          const group = tenantGroups.get(tenantId)!;
          group.units.push({
            unitId: tenancy.unit.id,
            unitNumber: tenancy.unit.unitNumber,
            propertyId: tenancy.property.id,
            propertyName: tenancy.property.name,
            rentAmount: tenancy.monthlyRent,
            status: tenancy.status === 'active' ? 'active' : 'inactive',
            leaseStartDate: tenancy.startDate,
            leaseEndDate: tenancy.endDate || ''
          });

          group.totalRent += tenancy.monthlyRent;
          
          // Set overall status - if any unit is active, tenant is active
          if (tenancy.status === 'active') {
            group.status = 'active';
          }
        });

        const groupedTenantsArray = Array.from(tenantGroups.values());
        console.log('Grouped tenants:', groupedTenantsArray);
        
        setGroupedTenants(groupedTenantsArray);} catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load tenants";
        console.error("Tenants error:", errorMessage, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
    fetchProperties();
  }, []);

  // Fetch available units when property is selected
  useEffect(() => {
    const fetchAvailableUnits = async () => {
      if (selectedPropertyId) {
        try {
          const units = await unitsService.getByPropertyAndStatus(selectedPropertyId, "available");
          setAvailableUnits(units || []);
        } catch (err) {
          console.error("Error fetching available units:", err);
          setAvailableUnits([]);
        }
      } else {
        setAvailableUnits([]);
      }
    };

    fetchAvailableUnits();
  }, [selectedPropertyId]);

  const fetchProperties = async () => {
    try {
      const propertiesData = await propertiesService.getAll();
      setProperties(propertiesData || []);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };  const resetTenancyForm = () => {
    setTenancyFormData({
      propertyId: "",
      unitIds: [],
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      idNumber: "",
      emergencyContact: "",
      monthlyRent: "",
      startDate: "",
    });
    setSelectedPropertyId(null);
    setAvailableUnits([]);
  };  const handleTenancyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTenancyFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = parseInt(e.target.value);
    setSelectedPropertyId(propertyId || null);
    setTenancyFormData((prev) => ({
      ...prev,
      propertyId: e.target.value,
      unitIds: [], // Reset unit selection when property changes
    }));
  };

  const handleUnitSelection = (unitId: string) => {
    setTenancyFormData((prev) => {
      const currentUnitIds = prev.unitIds;
      const isSelected = currentUnitIds.includes(unitId);

      return {
        ...prev,
        unitIds: isSelected ? currentUnitIds.filter((id) => id !== unitId) : [...currentUnitIds, unitId],
      };
    });
  };  const handleCreateTenancy = () => {
    resetTenancyForm();
    setShowCreateTenancyModal(true);
  };  const handleCloseModal = () => {
    setShowCreateTenancyModal(false);
    resetTenancyForm();
  };
  const handleTenancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tenancyData = {
        propertyId: parseInt(tenancyFormData.propertyId),
        unitIds: tenancyFormData.unitIds.map((id) => parseInt(id)),
        firstName: tenancyFormData.firstName,
        lastName: tenancyFormData.lastName,
        email: tenancyFormData.email,
        phone: tenancyFormData.phone,
        idNumber: tenancyFormData.idNumber,
        emergencyContact: tenancyFormData.emergencyContact,
        monthlyRent: parseFloat(tenancyFormData.monthlyRent),
        startDate: tenancyFormData.startDate,
      };

      await unitTenancyService.createComplete(tenancyData);
      setSuccessMessage("Tenancy created successfully! Tenant has been assigned to the selected units.");

      handleCloseModal();

      // Refresh tenant list to show the new tenancy
      window.location.reload(); // Simple approach - you could optimize this

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create tenancy";
      setError(errorMessage);
      console.error("Create tenancy error:", errorMessage);
    }
  };

  const handleRemoveTenant = async (tenantId: number) => {
    if (window.confirm('Are you sure you want to remove this tenant? This will end their tenancy and make their unit(s) available.')) {
      try {
        // Find the tenancy for this tenant and end it
        await unitTenancyService.delete(tenantId);
        setSuccessMessage("Tenant removed successfully. Their unit(s) are now available.");        
        // Refresh tenant list to show the new tenancy
        const tenanciesData: UnitTenancy[] = await unitTenancyService.getAll();
        
        // Group tenants by tenant ID to avoid duplicates
        const tenantGroups = new Map<number, GroupedTenant>();

        tenanciesData.forEach(tenancy => {
          const tenantId = tenancy.tenant.id;
          const nameParts = tenancy.tenant.name ? tenancy.tenant.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          if (!tenantGroups.has(tenantId)) {
            tenantGroups.set(tenantId, {
              id: tenantId,
              firstName,
              lastName,
              email: tenancy.tenant.email,
              phone: tenancy.tenant.phone,
              units: [],
              totalRent: 0,
              status: 'active'
            });
          }

          const group = tenantGroups.get(tenantId)!;
          group.units.push({
            unitId: tenancy.unit.id,
            unitNumber: tenancy.unit.unitNumber,
            propertyId: tenancy.property.id,
            propertyName: tenancy.property.name,
            rentAmount: tenancy.monthlyRent,
            status: tenancy.status === 'active' ? 'active' : 'inactive',
            leaseStartDate: tenancy.startDate,
            leaseEndDate: tenancy.endDate || ''
          });

          group.totalRent += tenancy.monthlyRent;
          
          // Set overall status - if any unit is active, tenant is active
          if (tenancy.status === 'active') {
            group.status = 'active';
          }
        });

        const groupedTenantsArray = Array.from(tenantGroups.values());
        setGroupedTenants(groupedTenantsArray);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to remove tenant";
        setError(errorMessage);
        console.error("Remove tenant error:", errorMessage);
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "late":
        return "bg-red-100 text-red-800";
      default:        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      {successMessage && <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tenants</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all tenants including their contact information, assigned unit, and lease details.
          </p>{" "}
        </div>{" "}        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleCreateTenancy}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Tenant
          </button>
        </div>
      </div>      {/* Responsive Grid Layout */}
      <div className="mt-8">
        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden lg:block">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Contact
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Units
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Total Rent
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {groupedTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <Link to={`/tenants/${tenant.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {tenant.firstName} {tenant.lastName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div>{tenant.email}</div>
                      <div>{tenant.phone}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="space-y-1">
                        {tenant.units.map((unit) => (
                          <div key={unit.unitId} className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <Link to={`/units/${unit.unitId}`} className="text-indigo-600 hover:text-indigo-900">
                                Unit {unit.unitNumber}
                              </Link>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs">${unit.rentAmount}/mo</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              <Link to={`/properties/${unit.propertyId}`} className="text-indigo-400 hover:text-indigo-600">
                                {unit.propertyName}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium">${tenant.totalRent}/mo</div>
                      <div className="text-xs text-gray-400">{tenant.units.length} unit{tenant.units.length > 1 ? 's' : ''}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(
                          tenant.status
                        )}`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex flex-col space-y-2">
                        <Link to={`/tenants/${tenant.id}`} className="text-indigo-600 hover:text-indigo-900">
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleRemoveTenant(tenant.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View - Hidden on desktop */}
        <div className="lg:hidden grid gap-4 sm:gap-6">
          {groupedTenants.map((tenant) => (
            <div key={tenant.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                {/* Header with name and status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link to={`/tenants/${tenant.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {tenant.firstName} {tenant.lastName}
                      </Link>
                    </h3>
                    <div className="mt-1 flex flex-col space-y-1 text-sm text-gray-500">
                      <a href={`mailto:${tenant.email}`} className="text-indigo-600 hover:text-indigo-900">
                        {tenant.email}
                      </a>
                      <a href={`tel:${tenant.phone}`} className="text-indigo-600 hover:text-indigo-900">
                        {tenant.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(
                        tenant.status
                      )}`}
                    >
                      {tenant.status}
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">${tenant.totalRent}/mo</div>
                      <div className="text-xs text-gray-500">{tenant.units.length} unit{tenant.units.length > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>

                {/* Units section */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Units:</h4>
                  <div className="space-y-2">
                    {tenant.units.map((unit) => (
                      <div key={unit.unitId} className="bg-gray-50 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Link 
                                to={`/units/${unit.unitId}`} 
                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                              >
                                Unit {unit.unitNumber}
                              </Link>
                              <span className="text-sm font-medium text-gray-900">${unit.rentAmount}/mo</span>
                            </div>
                            <div className="mt-1">
                              <Link 
                                to={`/properties/${unit.propertyId}`} 
                                className="text-sm text-indigo-500 hover:text-indigo-700"
                              >
                                {unit.propertyName}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Link 
                      to={`/tenants/${tenant.id}`}
                      className="flex-1 bg-indigo-600 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleRemoveTenant(tenant.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Remove Tenant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {groupedTenants.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new tenant.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateTenancy}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Tenant
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Create Complete Tenancy Modal */}
      {showCreateTenancyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-2 sm:p-8">
          <div className="relative w-full max-w-2xl mx-auto p-5 border shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Tenant</h3>
              <p className="text-sm text-gray-600 mb-6">
                Create a new tenant and assign them to units. This will also create the tenancy relationship automatically.
              </p>
              <form onSubmit={handleTenancySubmit} className="space-y-6">
                {/* Property Selection */}
                <div>
                  <label htmlFor="tenancy-propertyId" className="block text-sm font-medium text-gray-700">
                    Property *
                  </label>
                  <select
                    name="propertyId"
                    id="tenancy-propertyId"
                    required
                    value={tenancyFormData.propertyId}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.address}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Unit Selection */}
                {availableUnits.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Units * (Select one or more)</label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableUnits.map((unit) => (
                        <label key={unit.id} className="flex items-center space-x-3 py-2">
                          <input
                            type="checkbox"
                            checked={tenancyFormData.unitIds.includes(unit.id.toString())}
                            onChange={() => handleUnitSelection(unit.id.toString())}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900">
                            Unit {unit.unitNumber} - ${unit.rentAmount}/month
                          </span>
                        </label>
                      ))}
                    </div>
                    {tenancyFormData.unitIds.length === 0 && <p className="text-sm text-red-600 mt-1">Please select at least one unit</p>}
                  </div>
                )}

                {/* Tenant Information */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Tenant Information</h4>                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tenancy-firstName" className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="tenancy-firstName"
                        required
                        value={tenancyFormData.firstName}
                        onChange={handleTenancyInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="tenancy-lastName" className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="tenancy-lastName"
                        required
                        value={tenancyFormData.lastName}
                        onChange={handleTenancyInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="tenancy-email" className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="tenancy-email"
                        required
                        value={tenancyFormData.email}
                        onChange={handleTenancyInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="tenancy-phone" className="block text-sm font-medium text-gray-700">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="tenancy-phone"
                        required
                        value={tenancyFormData.phone}
                        onChange={handleTenancyInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="tenancy-idNumber" className="block text-sm font-medium text-gray-700">
                        ID Number
                      </label>
                      <input
                        type="text"
                        name="idNumber"
                        id="tenancy-idNumber"
                        value={tenancyFormData.idNumber}
                        onChange={handleTenancyInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="tenancy-emergencyContact" className="block text-sm font-medium text-gray-700">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        id="tenancy-emergencyContact"
                        value={tenancyFormData.emergencyContact}
                        onChange={handleTenancyInputChange}
                        placeholder="Name: Phone"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Lease Information */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Lease Information</h4>                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tenancy-monthlyRent" className="block text-sm font-medium text-gray-700">
                        Monthly Rent ($) *
                      </label>
                      <input
                        type="number"
                        name="monthlyRent"
                        id="tenancy-monthlyRent"
                        required
                        min="0"
                        step="0.01"
                        value={tenancyFormData.monthlyRent}
                        onChange={handleTenancyInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="tenancy-startDate" className="block text-sm font-medium text-gray-700">
                        Lease Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        id="tenancy-startDate"
                        required
                        value={tenancyFormData.startDate}
                        onChange={handleTenancyInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>                <div className="flex flex-col-reverse sm:flex-row justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={tenancyFormData.unitIds.length === 0}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
