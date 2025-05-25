import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastName?: string;
  role: string;
  age?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'usersList' | 'addUser' | 'login' | 'register'>('login');
  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    email: string;
    name: string;
    age: string;
    role: string;
  }>({
    username: "",
    password: "",
    email: "",
    name: "",
    age: "",
    role: "USER",
  });
  
  const [loginData, setLoginData] = useState<{
    username: string;
    password: string;
  }>({
    username: "",
    password: "",
  });
  
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    isLoading: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Check if user is already authenticated when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Fetch users if authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchUsers();
    }
  }, [auth.isAuthenticated]);
  
  // Check if user is already authenticated
  const checkAuthStatus = () => {
    fetch("http://192.168.88.251:8080/api/auth/me", {
      method: "GET",
      credentials: "include", // Important for cookies
    })
      .then(async (res) => {
        if (res.status === 200) {
          const user = await res.json();
          setAuth({
            isAuthenticated: true,
            currentUser: user,
            isLoading: false
          });
          return user;
        } else {
          setAuth({
            isAuthenticated: false,
            currentUser: null,
            isLoading: false
          });
          return null;
        }
      })
      .catch(err => {
        console.error("Failed to check authentication status:", err);
        setAuth({
          isAuthenticated: false,
          currentUser: null,
          isLoading: false
        });
      });
  };

  const fetchUsers = () => {
    setIsLoading(true);
    setError(null);
    
    fetch("http://192.168.88.251:8080/api/users", {
      credentials: "include" // Include cookies
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Error fetching users");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Users data:", data);
        setUsers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again.");
        setIsLoading(false);
      });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    fetch("http://192.168.88.251:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify({
        username: loginData.username,
        password: loginData.password
      }),
    })
      .then(async (res) => {
        if (res.status !== 200) {
          const text = await res.text();
          let errorMsg;
          try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.message || "Login failed";
          } catch (e) {
            errorMsg = "Login failed. Please try again.";
          }
          throw new Error(errorMsg);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Login successful:", data);
        setAuth({
          isAuthenticated: true,
          currentUser: data,
          isLoading: false
        });
        setActiveTab('usersList');
        setSuccess("Login successful!");
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Login failed:", err);
        setError(`Login failed: ${err.message}`);
        setIsLoading(false);
      });
  };

  const handleLogout = () => {
    setIsLoading(true);
    
    fetch("http://192.168.88.251:8080/api/auth/logout", {
      method: "POST",
      credentials: "include" // Include cookies
    })
      .then(() => {
        setAuth({
          isAuthenticated: false,
          currentUser: null,
          isLoading: false
        });
        setActiveTab('login');
        setUsers([]);
        setSuccess("Logged out successfully");
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Logout failed:", err);
        setError("Logout failed. Please try again.");
        setIsLoading(false);
      });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    // Log what we're submitting for debugging
    console.log("Submitting user data:", {
      username: newUser.username,
      password: newUser.password,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      age: parseInt(newUser.age, 10)
    });
    
    fetch("http://192.168.88.251:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: newUser.username,
        password: newUser.password,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        age: parseInt(newUser.age, 10)
      }),
    })
      .then(async (res) => {
        console.log("Response status:", res.status);
        const responseText = await res.text();
        console.log("Response body:", responseText);
        let data;
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.log("Response is not JSON");
          data = { message: responseText };
        }
        if (res.status !== 200 && res.status !== 201) {
          throw new Error(data.message || `Server returned ${res.status}`);
        }
        return data;
      })
      .then((data) => {
        console.log("New user created:", data);
        setSuccess("User successfully registered! You can now log in.");
        setActiveTab('login');
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to register user:", err);
        setError(`Registration failed: ${err.message}`);
        setIsLoading(false);
      });
  };
  
  // const handleUserUpdate = (userId: number, userData: Partial<User>) => {
  //   setIsLoading(true);
  //   setError(null);
    
  //   fetch(`http://192.168.88.251:8080/api/users/${userId}`, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //     body: JSON.stringify(userData),
  //   })
  //     .then(async (res) => {
  //       if (res.status !== 200) {
  //         const text = await res.text();
  //         let errorMsg;
  //         try {
  //           const errorData = JSON.parse(text);
  //           errorMsg = errorData.message || "Update failed";
  //         } catch (e) {
  //           errorMsg = "Update failed. Please try again.";
  //         }
  //         throw new Error(errorMsg);
  //       }
  //       return res.json();
  //     })
  //     .then((data) => {
  //       console.log("User updated:", data);
  //       // Update local users list
  //       setUsers(users.map(user => user.id === userId ? data : user));
  //       setSuccess("User updated successfully!");
  //       setIsLoading(false);
  //     })
  //     .catch(err => {
  //       console.error("Failed to update user:", err);
  //       setError(`Update failed: ${err.message}`);
  //       setIsLoading(false);
  //     });
  // };
  
  const handleUserDelete = (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    fetch(`http://192.168.88.251:8080/api/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status !== 200 && res.status !== 204) {
          const text = await res.text();
          let errorMsg;
          try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.message || "Delete failed";
          } catch (e) {
            errorMsg = "Delete failed. Please try again.";
          }
          throw new Error(errorMsg);
        }
        // Remove user from state
        setUsers(users.filter(user => user.id !== userId));
        setSuccess("User deleted successfully!");
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to delete user:", err);
        setError(`Delete failed: ${err.message}`);
        setIsLoading(false);
      });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Main content wrapper with responsive layout */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Content area - takes full width on mobile, restricted width on larger screens */}
        <div className="md:col-span-12 lg:col-span-8">
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto p-4 max-w-5xl">
              <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-600">Bomahub User Manager</h1>
                {auth.isAuthenticated && (
                  <div className="flex items-center">
                    <div className="mr-4 text-sm">
                      <span className="font-medium">{auth.currentUser?.name || 'User'}</span>
                      <span className="mx-1 text-gray-500">|</span>
                      <span className="text-indigo-600 capitalize">
                        {auth.currentUser?.role ? auth.currentUser.role.toLowerCase() : 'user'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </header>
              
              {auth.isLoading ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Checking authentication...</p>
                </div>
              ) : auth.isAuthenticated ? (
                <>
                  {/* Tab Navigation for authenticated users */}
                  <div className="flex border-b mb-6">
                    <button 
                      className={`px-6 py-3 mr-2 text-lg font-medium ${activeTab === 'usersList' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700'} rounded-t-lg transition-colors duration-200`}
                      onClick={() => setActiveTab('usersList')}
                    >
                      Users List
                    </button>
                    {auth.currentUser?.role === "ADMIN" && (
                      <button 
                        className={`px-6 py-3 text-lg font-medium ${activeTab === 'addUser' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700'} rounded-t-lg transition-colors duration-200`}
                        onClick={() => setActiveTab('addUser')}
                      >
                        Add User
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
                      {success}
                    </div>
                  )}

                  {activeTab === 'usersList' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">User Directory</h2>
                        <button
                          onClick={fetchUsers}
                          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                      </div>
                      
                      {isLoading ? (
                        <div className="text-center py-10">
                          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading users...</p>
                        </div>
                      ) : users.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                          </svg>
                          <p className="text-gray-500 text-lg">No users found</p>
                          {auth.currentUser?.role === "ADMIN" && (
                            <button 
                              onClick={() => setActiveTab('addUser')} 
                              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                            >
                              Add Your First User
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {users.map((user) => (
                            <div key={user.id} className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition">
                              <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-semibold text-lg mr-4">
                                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <h2 className="text-xl font-semibold text-gray-800">{user.name || 'Unknown User'}</h2>
                                  <p className="text-gray-600">@{user.username || 'unnamed'}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Email:</span>
                                  <span className="font-medium text-gray-800">{user.email || 'No email'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Role:</span>
                                  <span className="font-medium text-gray-800 capitalize">{user.role ? user.role.toLowerCase() : 'user'}</span>
                                </div>
                                {user.age && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Age:</span>
                                    <span className="font-medium text-gray-800">{user.age} years</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Admin actions */}
                              {auth.currentUser?.role === "ADMIN" && auth.currentUser?.id !== user.id && (
                                <div className="flex justify-end mt-4 pt-4 border-t">
                                  <button
                                    onClick={() => handleUserDelete(user.id)}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'addUser' && auth.currentUser?.role === "ADMIN" && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New User</h2>
                      <form onSubmit={handleUserSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                              Username
                            </label>
                            <input
                              type="text"
                              id="username"
                              value={newUser.username}
                              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Username"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                              Password
                            </label>
                            <input
                              type="password"
                              id="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Password"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Name"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Email"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                              Age
                            </label>
                            <input
                              type="number"
                              id="age"
                              value={newUser.age}
                              onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Age"
                              min="1"
                              max="120"
                            />
                          </div>
                          <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                              Role
                            </label>
                            <select
                              id="role"
                              value={newUser.role}
                              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              required
                            >
                              <option value="USER">User</option>
                              <option value="MANAGER">Manager</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex justify-center items-center"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                              Creating...
                            </>
                          ) : (
                            'Create User'
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Login/Register tabs for unauthenticated users */}
                  <div className="flex justify-center border-b mb-6">
                    <button 
                      className={`px-6 py-3 mr-2 text-lg font-medium ${activeTab === 'login' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700'} rounded-t-lg transition-colors duration-200`}
                      onClick={() => setActiveTab('login')}
                    >
                      Login
                    </button>
                    <button 
                      className={`px-6 py-3 text-lg font-medium ${activeTab === 'register' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700'} rounded-t-lg transition-colors duration-200`}
                      onClick={() => setActiveTab('register')}
                    >
                      Register
                    </button>
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
                      {success}
                    </div>
                  )}

                  {activeTab === 'login' && (
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login</h2>
                      <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                          <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            id="login-username"
                            value={loginData.username}
                            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Username"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            id="login-password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Password"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex justify-center items-center"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                              Logging in...
                            </>
                          ) : (
                            'Login'
                          )}
                        </button>
                      </form>
                      <div className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                          onClick={() => setActiveTab('register')}
                          className="text-indigo-600 hover:underline"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'register' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Register</h2>
                      <form onSubmit={handleUserSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1">
                              Username
                            </label>
                            <input
                              type="text"
                              id="reg-username"
                              value={newUser.username}
                              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Username"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                              Password
                            </label>
                            <input
                              type="password"
                              id="reg-password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Password"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              id="reg-name"
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Name"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              id="reg-email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Email"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="reg-age" className="block text-sm font-medium text-gray-700 mb-1">
                              Age
                            </label>
                            <input
                              type="number"
                              id="reg-age"
                              value={newUser.age}
                              onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                              placeholder="Age"
                              min="1"
                              max="120"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex justify-center items-center"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                              Registering...
                            </>
                          ) : (
                            'Register'
                          )}
                        </button>
                      </form>
                      <div className="mt-4 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                          onClick={() => setActiveTab('login')}
                          className="text-indigo-600 hover:underline"
                        >
                          Login
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar area - only visible on larger screens */}
        <div className="hidden lg:block lg:col-span-4">
          {/* Sidebar content goes here */}
        </div>
      </div>
    </div>
  );
}

export default App;
