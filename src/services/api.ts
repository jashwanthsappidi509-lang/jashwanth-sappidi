const API_BASE = '/api';

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  if (isJson) {
    const text = await res.text();
    if (!text) {
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      return null;
    }
    try {
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
      return data;
    } catch (e) {
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      throw new Error(`Failed to parse JSON: ${text.slice(0, 100)}`);
    }
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return text;
};

export const api = {
  // Auth
  register: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  login: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    if (result.token) localStorage.setItem('token', result.token);
    return result;
  },
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  updateProfile: async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Recommendations
  getRecommendations: async (data: any) => {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  getFertilizer: async (data: any) => {
    const res = await fetch(`${API_BASE}/recommendations/fertilizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Yield Prediction
  predictYield: async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/predictions/yield`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Weather
  getWeather: async (lat?: number, lon?: number, location?: string) => {
    const res = await fetch(`${API_BASE}/weather?lat=${lat || ''}&lon=${lon || ''}&location=${location || ''}`);
    return handleResponse(res);
  },

  // Market
  getMarketPrices: async (params: { crop?: string, state?: string, category?: string, sortBy?: string, order?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.crop) query.append('crop', params.crop);
    if (params.state) query.append('state', params.state);
    if (params.category) query.append('category', params.category);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);
    
    const res = await fetch(`${API_BASE}/market/prices?${query.toString()}`);
    return handleResponse(res);
  },

  // Google OAuth
  getGoogleAuthUrl: async () => {
    const res = await fetch(`${API_BASE}/auth/google/url`);
    return handleResponse(res);
  },
  verifyGoogleIdToken: async (idToken: string) => {
    const res = await fetch(`${API_BASE}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    return handleResponse(res);
  },
};
