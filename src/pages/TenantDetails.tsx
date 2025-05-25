import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { unitTenancyService, paymentsService } from "../services/api";
import type { UnitTenancy, Payment } from "../types/api";
import Alert from "../components/common/Alert";
import LoadingSpinner from "../components/common/LoadingSpinner";

const TenantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenantTenancies, setTenantTenancies] = useState<UnitTenancy[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    selectedPaymentIds: [] as number[],
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
    description: ''
  });  useEffect(() => {
    const fetchTenantDetails = async () => {
      if (!id) {
        setError("Invalid tenant ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch all tenancies and find all the ones for this tenant
        const allTenancies: UnitTenancy[] = await unitTenancyService.getAll();
        const tenantTenancies = allTenancies.filter(tenancy => tenancy.tenant.id === parseInt(id));
        
        if (tenantTenancies.length === 0) {
          setError("Tenant not found");
          return;
        }

        setTenantTenancies(tenantTenancies);

        // Fetch pending payments for all this tenant's unit tenancies
        try {
          const allPayments: Payment[] = [];
          for (const tenancy of tenantTenancies) {
            const payments = await paymentsService.getByUnitTenancy(tenancy.id);
            allPayments.push(...payments);
          }
          const pendingPayments = allPayments.filter((payment: Payment) => payment.paymentStatus === 'pending');
          setPendingPayments(pendingPayments);
        } catch (paymentError) {
          console.warn("Failed to fetch payments:", paymentError);
          setPendingPayments([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load tenant details";
        setError(errorMessage);
        console.error("Tenant details error:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantDetails();
  }, [id]);

  const handlePaymentSelection = (paymentId: number, checked: boolean) => {
    setPaymentForm(prev => ({
      ...prev,
      selectedPaymentIds: checked 
        ? [...prev.selectedPaymentIds, paymentId]
        : prev.selectedPaymentIds.filter(id => id !== paymentId)
    }));
  };

  const calculateSelectedTotal = () => {
    return pendingPayments
      .filter(payment => paymentForm.selectedPaymentIds.includes(payment.id))
      .reduce((total, payment) => total + payment.amount, 0);
  };
  const handleProcessPayment = async () => {
    if (paymentForm.selectedPaymentIds.length === 0) {
      setError("Please select at least one payment to process");
      return;
    }

    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (tenantTenancies.length === 0) {
      setError("No tenant information available");
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      await paymentsService.processPayments({
        tenantId: tenantTenancies[0].tenant.id,
        pendingPaymentIds: paymentForm.selectedPaymentIds,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber,
        description: paymentForm.description
      });

      setSuccessMessage("Payment processed successfully");
      setShowPaymentModal(false);
      
      // Reset form
      setPaymentForm({
        selectedPaymentIds: [],
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: '',
        description: ''
      });

      // Refresh pending payments
      const allPayments: Payment[] = [];
      for (const tenancy of tenantTenancies) {
        const payments = await paymentsService.getByUnitTenancy(tenancy.id);
        allPayments.push(...payments);
      }
      const pendingPayments = allPayments.filter((payment: Payment) => payment.paymentStatus === 'pending');
      setPendingPayments(pendingPayments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process payment";
      setError(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "short",
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const getStatusBadgeClass = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  if (loading) {
    return <LoadingSpinner message="Loading tenant details..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Alert type="error" message={error} onDismiss={() => setError(null)} />
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/tenants")}
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Tenants
          </button>
        </div>
      </div>
    );
  }  if (!tenantTenancies || tenantTenancies.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Alert type="error" message="Tenant not found" />
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/tenants")}
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  const { tenant } = tenantTenancies[0];
  // Split tenant name for display
  const nameParts = tenant.name ? tenant.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  // Calculate total rent across all units
  const totalRent = tenantTenancies.reduce((sum, tenancy) => sum + tenancy.monthlyRent, 0);
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/tenants"
              className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block"
            >
              ← Back to Tenants
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {firstName} {lastName}
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Tenant Details • {tenantTenancies.length} unit{tenantTenancies.length > 1 ? 's' : ''} • ${totalRent.toLocaleString()}/month total
            </p>
          </div>
        </div>
      </div>

      {/* Tenant Information Card */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={`mailto:${tenant.email}`} className="text-indigo-600 hover:text-indigo-900">
                  {tenant.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={`tel:${tenant.phone}`} className="text-indigo-600 hover:text-indigo-900">
                  {tenant.phone}
                </a>
              </dd>
            </div>
            {tenant.idNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">ID Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant.idNumber}</dd>
              </div>
            )}
            {tenant.emergencyContact && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant.emergencyContact}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>      {/* Current Tenancies */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Current Units ({tenantTenancies.length})</h2>
        </div>        <div className="px-6 py-5 space-y-4">
          {tenantTenancies.map((tenancy) => (
            <div key={tenancy.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link 
                        to={`/units/${tenancy.unit.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Unit {tenancy.unit.unitNumber}
                      </Link>
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(tenancy.status === 'active')}`}
                    >
                      {getStatusText(tenancy.status === 'active')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <Link 
                      to={`/properties/${tenancy.property.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {tenancy.property.name}
                    </Link>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tenancy.property.address}
                  </p>
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  <p className="text-lg font-semibold text-gray-900">
                    ${tenancy.monthlyRent.toLocaleString()}/month
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <span className="ml-2 text-gray-900">{formatDate(tenancy.startDate)}</span>
                </div>
                <div>
                  <span className="text-gray-500">End Date:</span>
                  <span className="ml-2 text-gray-900">
                    {tenancy.endDate ? formatDate(tenancy.endDate) : "Ongoing"}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 text-gray-900 capitalize">{tenancy.status}</span>
                </div>
                <div>
                  <span className="text-gray-500">Unit Status:</span>
                  <span className="ml-2 text-gray-900 capitalize">{tenancy.unit.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>      {/* Properties Information */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Properties ({new Set(tenantTenancies.map(t => t.property.id)).size})</h2>
        </div>
        <div className="px-6 py-5 space-y-6">
          {/* Group tenancies by property */}
          {Array.from(new Set(tenantTenancies.map(t => t.property.id))).map(propertyId => {
            const propertyTenancies = tenantTenancies.filter(t => t.property.id === propertyId);
            const property = propertyTenancies[0].property;
            return (
              <div key={propertyId} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <Link 
                    to={`/properties/${property.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {property.name}
                  </Link>
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{property.type.toLowerCase()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Units in this Property</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {propertyTenancies.map(t => `Unit ${t.unit.unitNumber}`).join(', ')}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property.address}</dd>
                  </div>
                  {property.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{property.description}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Units</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property.totalUnits}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Available Units</dt>
                    <dd className="mt-1 text-sm text-gray-900">{property.availableUnits}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900">Pending Payments</h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Process Payment
              </button>
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingPayments.map((payment) => (                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />
      )}
      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} />
      )}      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowPaymentModal(false)}
            ></div>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Process Payment
                    </h3>
                    
                    {/* Payment Selection */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Select payments to process:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {pendingPayments.map((payment) => (
                          <label key={payment.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={paymentForm.selectedPaymentIds.includes(payment.id)}
                              onChange={(e) => handlePaymentSelection(payment.id, e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />                            <span className="ml-3 text-sm text-gray-700">
                              {payment.description} - ${payment.amount.toLocaleString()} 
                              (Due: {formatDate(payment.dueDate)})
                            </span>
                          </label>
                        ))}
                      </div>
                      {paymentForm.selectedPaymentIds.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-700">
                            Selected total: ${calculateSelectedTotal().toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Payment Form */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                        <input
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                          value={paymentForm.paymentMethod}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="CASH">Cash</option>
                          <option value="MOBILE_MONEY">Mobile Money</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                        <input
                          type="text"
                          value={paymentForm.referenceNumber}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Transaction reference"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea
                          value={paymentForm.description}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={processingPayment || paymentForm.selectedPaymentIds.length === 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayment ? "Processing..." : "Process Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetails;
