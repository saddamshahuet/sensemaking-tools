import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh or redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
};

// Users API
export const usersApi = {
  me: () => api.get('/users/me'),
  update: (data: { name?: string; email?: string }) =>
    api.put('/users/me', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/me/password', data),
};

// Projects API
export const projectsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/projects', { params }),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string; additionalContext?: string }) =>
    api.post('/projects', data),
  update: (id: string, data: { name?: string; description?: string; additionalContext?: string }) =>
    api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Reports API
export const reportsApi = {
  listByProject: (projectId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/reports/project/${projectId}`, { params }),
  get: (id: string) => api.get(`/reports/${id}`),
  getSummary: (id: string) => api.get(`/reports/${id}/summary`),
  create: (data: { projectId: string; name: string }) =>
    api.post('/reports', data),
  update: (id: string, data: { name?: string }) =>
    api.put(`/reports/${id}`, data),
  delete: (id: string) => api.delete(`/reports/${id}`),
  startProcessing: (id: string, csvUploadId?: string) =>
    api.post(`/reports/${id}/process`, { csvUploadId }),
};

// Uploads API
export const uploadsApi = {
  upload: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/uploads/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listByProject: (projectId: string) =>
    api.get(`/uploads/project/${projectId}`),
  get: (id: string) => api.get(`/uploads/${id}`),
  delete: (id: string) => api.delete(`/uploads/${id}`),
};

// Jobs API
export const jobsApi = {
  get: (id: string) => api.get(`/jobs/${id}`),
  cancel: (id: string) => api.post(`/jobs/${id}/cancel`),
};

// Export API
export const exportApi = {
  downloadPdf: async (reportId: string) => {
    const response = await api.get(`/export/reports/${reportId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  downloadJson: async (reportId: string) => {
    const response = await api.get(`/export/reports/${reportId}/json`, {
      responseType: 'blob',
    });
    return response.data;
  },
  downloadHtml: async (reportId: string) => {
    const response = await api.get(`/export/reports/${reportId}/html?download=true`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// API Keys API
export const apiKeysApi = {
  list: () => api.get('/api-keys'),
  create: (data: { name: string }) => api.post('/api-keys', data),
  revoke: (id: string) => api.post(`/api-keys/${id}/revoke`),
  delete: (id: string) => api.delete(`/api-keys/${id}`),
};

// Collaborators API
export const collaboratorsApi = {
  listByProject: (projectId: string) =>
    api.get(`/collaborators/projects/${projectId}`),
  invite: (projectId: string, data: { email: string; role: 'VIEWER' | 'EDITOR' | 'ADMIN' }) =>
    api.post(`/collaborators/projects/${projectId}/invite`, data),
  getPendingInvitations: () => api.get('/collaborators/invitations'),
  accept: (id: string) => api.post(`/collaborators/${id}/accept`),
  decline: (id: string) => api.post(`/collaborators/${id}/decline`),
  updateRole: (id: string, role: 'VIEWER' | 'EDITOR' | 'ADMIN') =>
    api.put(`/collaborators/${id}/role`, { role }),
  remove: (id: string) => api.delete(`/collaborators/${id}`),
};

// Realtime API (SSE)
export const realtimeApi = {
  subscribeToJobProgress: (jobId: string, onMessage: (data: unknown) => void) => {
    const token = localStorage.getItem('accessToken');
    const eventSource = new EventSource(
      `${API_BASE_URL}/realtime/jobs/${jobId}/progress?token=${token}`
    );
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        console.error('Failed to parse SSE message');
      }
    };
    
    eventSource.onerror = () => {
      eventSource.close();
    };
    
    return () => eventSource.close();
  },
};
