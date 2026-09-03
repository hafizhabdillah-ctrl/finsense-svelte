import api from './api';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return { accessToken, refreshToken, user };
  },

  async logout(refreshToken: string) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async register(email: string, password: string, full_name: string) {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name,
    });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(full_name: string, email: string) {
    const response = await api.put('/auth/profile', { full_name, email });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};

export const umkmService = {
  async getProfile() {
    const response = await api.get('/umkm');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.post('/umkm', data);
    return response.data;
  },
};

export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getGraphData() {
    const response = await api.get('/dashboard/graph');
    return response.data;
  },

  async getStockData() {
    const response = await api.get('/dashboard/stock');
    return response.data;
  },

  async getRecentTransactions() {
    const response = await api.get('/dashboard/recent');
    return response.data;
  },
};

export const stockService = {
  async getAll(search?: string) {
    const params = search ? { search } : {};
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export const transactionService = {
  async getAll(search?: string) {
    const params = search ? { search } : {};
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export const debtService = {
  async getAll(search?: string) {
    const params = search ? { search } : {};
    const response = await api.get('/debts', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/debts/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/debts', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/debts/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/debts/${id}`);
    return response.data;
  },
};

export const logService = {
  async getAll(search?: string) {
    const params = search ? { search } : {};
    const response = await api.get('/stock-logs', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/stock-logs/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/stock-logs', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/stock-logs/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/stock-logs/${id}`);
    return response.data;
  },
};
