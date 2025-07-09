// Base API URL
const API_BASE_URL = "http://localhost:8080/api";

// Common headers for JSON requests
const jsonHeaders = {
  "Content-Type": "application/json",
};

// API fetcher function that ensures credentials are included
const apiFetch = async (url: string, options: RequestInit = {}) => {
  // Always include credentials in all requests
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include", // This is critical for auth cookies
    headers: {
      ...(options.headers || {}),
    },
  };

  console.log(`API Request: ${url}`, { method: options.method || "GET" });

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    console.error(`API Error: ${url} - ${response.status} ${response.statusText}`);
    
    // Try to get error details from response body
    try {
      const errorBody = await response.text();
      if (errorBody) {
        console.error(`Error details:`, errorBody);
        const errorData = JSON.parse(errorBody);
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
    } catch (parseError) {
      // If we can't parse the error body, use the status
    }
    
    throw new Error(`Request failed with status ${response.status}`);
  }

  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    return null;
  }
};

// Auth API Service
export const authService = {
  login: async (username: string, password: string) => {
    const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username, password }),
    });

    return response;
  },
  register: async (userData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(userData),
    });

    return response;
  },

  logout: async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    });

    return response;
  },

  getCurrentUser: async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/me`);
    return response;
  },
};

// Properties API Service
export const propertiesService = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/properties`);

    return response;
  },

  getByOrganization: async (organizationId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/properties/organization/${organizationId}`);

    return response;
  },

  getById: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/properties/${id}`);

    return response;
  },
  create: async (propertyData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/properties/create-property`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(propertyData),
    });

    return response;
  },

  update: async (id: number, propertyData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/properties/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(propertyData),
    });

    return response;
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/properties/${id}`, {
      method: "DELETE",
    });

    return response;
  },

  // Enhanced endpoint to create property with floors and units structure
  createPropertyWithStructure: async (propertyData: {
    propertyName: string;
    propertyAddress: string;
    floorCount: number;
    unitsPerFloor: number;
    defaultRent: number;
    startFloor?: number;
    customFloorUnits?: number;
    customFloorRent?: number;
  }) => {
    const response = await apiFetch(`${API_BASE_URL}/properties/create-property`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(propertyData),
    });

    return response;
  },
};

// Units API Service
export const unitsService = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/units`);

    return response;
  },

  getById: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/units/${id}`);

    return response;
  },
  getByProperty: async (propertyId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/units/property/${propertyId}`);

    return response;
  },

  getByPropertyAndStatus: async (propertyId: number, status: string) => {
    const response = await apiFetch(`${API_BASE_URL}/units/property/${propertyId}/status/${status}`);

    return response;
  },

  getByFloor: async (floorId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/units/floor/${floorId}`);

    return response;
  },

  create: async (unitData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/units`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(unitData),
    });

    return response;
  },
  update: async (id: number, unitData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/units/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(unitData),
    });

    return response;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await apiFetch(`${API_BASE_URL}/units/${id}/status`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ status }),
    });

    return response;
  },

  //   updateStatus: async (id: number, status: string) => {
  //     const response = await apiFetch(`${API_BASE_URL}/units/${id}/status`, {
  //       method: 'PATCH',
  //       headers: jsonHeaders,
  //       body: JSON.stringify({ status }),
  //     });

  //     return response;
  //   },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/units/${id}`, {
      method: "DELETE",
    });

    return response;
  },
};

// Tenants API Service
export const tenantsService = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/tenants`);

    return response;
  },

  getById: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/tenants/${id}`);

    return response;
  },

  getByProperty: async (propertyId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/tenants/property/${propertyId}`);

    return response;
  },

  getByIdNumber: async (idNumber: string) => {
    const response = await apiFetch(`${API_BASE_URL}/tenants/id-number/${idNumber}`);

    return response;
  },

  getByEmail: async (email: string) => {
    const response = await apiFetch(`${API_BASE_URL}/tenants/email/${email}`);

    return response;
  },

  create: async (tenantData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/tenants`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(tenantData),
    });

    return response;
  },

  update: async (id: number, tenantData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/tenants/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(tenantData),
    });

    return response;
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/tenants/${id}`, {
      method: "DELETE",
    });

    return response;
  },
};

// Users API Service (for admin only)
export const usersService = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/users`);

    return response;
  },

  getById: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/users/${id}`);

    return response;
  },

  create: async (userData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(userData),
    });

    return response;
  },

  update: async (id: number, userData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(userData),
    });

    return response;
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });

    return response;
  },
};

// Unit Tenancy API Service
export const unitTenancyService = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/tenancies`);

    return response;
  },

  getById: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/tenancies/${id}`);

    return response;
  },

  getByUnit: async (unitId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/tenancies/unit/${unitId}`);

    return response;
  },
  getByTenant: async (tenantId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/tenancies/tenant/${tenantId}`);

    return response;
  },

  create: async (tenancyData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/tenancies`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(tenancyData),
    });

    return response;
  },

  update: async (id: number, tenancyData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/tenancies/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(tenancyData),
    });

    return response;
  },

  terminate: async (id: number, terminationData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/tenancies/${id}/end`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(terminationData),
    });

    return response;
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/tenancies/${id}`, {
      method: "DELETE",
    });

    return response;
  },
  // Enhanced endpoint to create complete tenancy with tenant data
  createComplete: async (tenancyData: {
    propertyId: number;
    unitIds: number[];
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber: string;
    emergencyContact: string;
    monthlyRent: number;
    startDate: string; // ISO date string
  }) => {
    // Backend expects flat structure according to api_endpoint.http
    const requestData = {
      propertyId: tenancyData.propertyId,
      unitIds: tenancyData.unitIds,
      firstName: tenancyData.firstName,
      lastName: tenancyData.lastName,
      email: tenancyData.email,
      phone: tenancyData.phone,
      idNumber: tenancyData.idNumber,
      emergencyContact: tenancyData.emergencyContact,
      monthlyRent: tenancyData.monthlyRent,
      startDate: tenancyData.startDate
    };

    const response = await apiFetch(`${API_BASE_URL}/tenancies`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(requestData),
    });

    return response;
  },
};

// Dashboard/Analytics API Service
export const analyticsService = {
  getDashboardStats: async (propertyId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/dashboard/property/${propertyId}/stats`);

    return response;
  },
};

// Organizations API Service
export const organizationsService = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/organizations`);
    return response;
  },

  getById: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/organizations/${id}`);
    return response;
  },

  getByVerificationCode: async (code: string) => {
    const response = await apiFetch(`${API_BASE_URL}/organizations/verify/${code}`);
    return response;
  },

  create: async (organizationData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/organizations`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(organizationData),
    });
    return response;
  },

  update: async (id: number, organizationData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/organizations/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(organizationData),
    });
    return response;
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/organizations/${id}`, {
      method: "DELETE",
    });
    return response;
  },
};

// Floors API Service
export const floorsService = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/floors`);
    return response;
  },

  getById: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/floors/${id}`);
    return response;
  },

  getByProperty: async (propertyId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/floors/property/${propertyId}`);
    return response;
  },

  create: async (floorData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/floors`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(floorData),
    });
    return response;
  },

  update: async (id: number, floorData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/floors/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(floorData),
    });
    return response;
  },

  delete: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/floors/${id}`, {
      method: "DELETE",
    });
    return response;
  },
};

// Payments API Service
export const paymentsService = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/payments`);
    return response;
  },
  
  getById: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/payments/${id}`);
    return response;
  },
  
  getByUnitTenancy: async (unitTenancyId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/payments/unit-tenancy/${unitTenancyId}`);
    return response;
  },
  
  getByProperty: async (propertyId: number) => {
    const response = await apiFetch(`${API_BASE_URL}/payments/property/${propertyId}`);
    return response;
  },
  
  getByPropertyAndStatus: async (propertyId: number, status: string) => {
    const response = await apiFetch(`${API_BASE_URL}/payments/property/${propertyId}/status/${status}`);
    return response;
  },
  
  create: async (paymentData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(paymentData),
    });
    return response;
  },
  
  update: async (id: number, paymentData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/payments/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(paymentData),
    });
    return response;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await apiFetch(`${API_BASE_URL}/payments/${id}/status`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ status }),
    });
    return response;
  },
  
  delete: async (id: number) => {
    const response = await apiFetch(`${API_BASE_URL}/payments/${id}`, {
      method: "DELETE",
    });
    return response;
  },
  
  processPayments: async (paymentData: {
    tenantId: number;
    pendingPaymentIds: number[];
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber: string;
    description?: string;
  }) => {
    const response = await apiFetch(`${API_BASE_URL}/payments/process-payment`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(paymentData),
    });
    return response;
  }
};
