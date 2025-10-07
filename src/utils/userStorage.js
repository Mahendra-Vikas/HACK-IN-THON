// User Storage Utility for DORA Authentication
// Simulates database operations with local JSON storage

let usersData = null;

// Initialize and load users data
async function loadUsers() {
  if (usersData) return usersData;
  
  try {
    const response = await fetch('/users.json');
    if (response.ok) {
      usersData = await response.json();
    } else {
      // If file doesn't exist, create default structure
      usersData = { users: [] };
    }
  } catch (error) {
    console.warn('Could not load users.json, using localStorage fallback');
    // Fallback to localStorage for demo purposes
    const stored = localStorage.getItem('dora_users');
    usersData = stored ? JSON.parse(stored) : { users: [] };
  }
  
  return usersData;
}

// Get all users
export async function getUsers() {
  await loadUsers();
  return usersData.users || [];
}

// Add a new user
export async function addUser(userData) {
  await loadUsers();
  
  const newUser = {
    id: `user_${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  usersData.users.push(newUser);
  
  // Save to localStorage as fallback (since we can't write to JSON file in browser)
  localStorage.setItem('dora_users', JSON.stringify(usersData));
  
  console.log('✅ User registered:', newUser.email);
  return newUser;
}

// Validate user credentials
export async function validateUser(email, password) {
  const users = await getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('dora_users', JSON.stringify(usersData));
    console.log('✅ User authenticated:', user.email);
    return user;
  }
  
  console.log('❌ Invalid credentials for:', email);
  return null;
}

// Check if user exists by email
export async function userExists(email) {
  const users = await getUsers();
  return users.some(u => u.email === email);
}

// Get current logged-in user from session
export function getCurrentUser() {
  const stored = localStorage.getItem('dora_current_user');
  return stored ? JSON.parse(stored) : null;
}

// Set current user session
export function setCurrentUser(user) {
  localStorage.setItem('dora_current_user', JSON.stringify(user));
}

// Clear current user session (logout)
export function clearCurrentUser() {
  localStorage.removeItem('dora_current_user');
}

// Check if user is logged in
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Get user profile data
export function getUserProfile() {
  const user = getCurrentUser();
  if (!user) return null;
  
  return {
    name: user.name,
    email: user.email,
    department: user.department,
    rollNumber: user.rollNumber,
    year: user.year,
    memberSince: new Date(user.createdAt).toLocaleDateString(),
    lastLogin: new Date(user.lastLogin).toLocaleDateString()
  };
}