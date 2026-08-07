const DEFAULT_API_URL = 'http://localhost:4000/api';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' 
      ? DEFAULT_API_URL
      : `${window.location.protocol}//${window.location.hostname.replace('3000', '4000')}/api`;
  }
  return DEFAULT_API_URL;
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();

// Load token from localStorage if available
let authToken: string | null = null;
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('token');
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

export const getAuthToken = () => authToken;

const request = async (endpoint: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || 'Something went wrong';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const api = {
  loginGuest: async (name?: string) => {
    const data = await request('/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (data.accessToken) {
      setAuthToken(data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  logout: () => {
    setAuthToken(null);
  },

  getTasks: async () => {
    return request('/tasks');
  },

  createTask: async (task: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
  }) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  updateTask: async (
    id: string,
    task: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
    },
  ) => {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  deleteTask: async (id: string) => {
    return request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
