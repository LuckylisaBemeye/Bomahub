// API Response Types based on actual backend responses

// Base Organization interface
export interface Organization {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  verificationCode: string;
}

// Property interface
export interface Property {
  id: number;
  name: string;
  address: string;
  description: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';
  totalUnits: number;
  availableUnits: number;
  createdAt: string | null;
  updatedAt: string;
  organization: Organization;
}

// Floor interface
export interface Floor {
  id: number;
  name: string;
  property: Property;
}

// Unit interface with proper nested structure
export interface Unit {
  id: number;
  unitNumber: string;
  status: 'available' | 'occupied' | 'maintenance';
  property: Property;
  floor: Floor;
  rentAmount?: number; // May not be in unit response, comes from tenancy
}

// Tenant interface
export interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  emergencyContact: string;
  property: Property | null;
}

// Unit Tenancy interface - this is the key relationship
export interface UnitTenancy {
  id: number;
  monthlyRent: number;
  status: 'active' | 'inactive' | 'terminated';
  startDate: string;
  endDate: string | null;
  tenant: Tenant;
  unit: Unit;
  property: Property;
}

// Payment interface
export interface Payment {
  id: number;
  amount: number;
  description: string;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  unitTenancy: UnitTenancy;
  property: Property;
}

// Auth response interface
export interface AuthUser {
  authorities: Array<{ authority: string }>;
  username: string;
}

// User interface for display (derived from auth)
export interface User {
  id?: number;
  username: string;
  role: string;
  name?: string;
  email?: string;
  organizationId?: number;
  organization?: Organization;
}

// Transform function to convert auth response to user
export function transformAuthResponseToUser(authResponse: AuthUser): User {
  // Extract role from authorities
  const role = authResponse.authorities?.[0]?.authority?.replace('ROLE_', '') || 'USER';
  
  return {
    username: authResponse.username,
    role: role,
    name: authResponse.username, // Use username as display name if no name provided
  };
}

// Transform function to convert UnitTenancy to a simplified Tenant view for table display
export interface TenantTableRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unitId: number;
  unitNumber: string;
  propertyId: number;
  propertyName: string;
  leaseStartDate: string;
  leaseEndDate: string;
  rentAmount: number;
  status: 'active' | 'inactive' | 'late';
}

export function transformUnitTenancyToTenantRow(tenancy: UnitTenancy): TenantTableRow {
  return {
    id: tenancy.tenant.id,
    firstName: tenancy.tenant.firstName,
    lastName: tenancy.tenant.lastName,
    email: tenancy.tenant.email,
    phone: tenancy.tenant.phone,
    unitId: tenancy.unit.id,
    unitNumber: tenancy.unit.unitNumber,
    propertyId: tenancy.property.id,
    propertyName: tenancy.property.name,
    leaseStartDate: tenancy.startDate,
    leaseEndDate: tenancy.endDate || '',
    rentAmount: tenancy.monthlyRent,
    status: tenancy.status === 'active' ? 'active' : 'inactive'
  };
}

// API Error interface
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

// Common API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Create Tenancy Request interface
export interface CreateTenancyRequest {
  propertyId: number;
  unitIds: number[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  emergencyContact: string;
  monthlyRent: number;
  startDate: string;
}

// Payment process request interface
export interface PaymentProcessRequest {
  tenantId: number;
  pendingPaymentIds: number[];
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
}