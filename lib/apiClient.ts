import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

export interface ApiErrorDetails {
  detail: string | Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  details: ApiErrorDetails | null;
  
  constructor(message: string, status: number, details?: ApiErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details || null;
  }
}

class ApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          // Server responded with a status code outside of 2xx
          const status = error.response.status;
          const details = error.response.data as ApiErrorDetails;
          
          // Handle specific error cases
          if (status === 401) {
            // Clear token on auth failure
            localStorage.removeItem('auth_token');
            // Redirect to login if not already there
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          
          throw new ApiError(
            typeof details.detail === 'string' ? details.detail : 'API Error',
            status,
            details
          );
        } else if (error.request) {
          // Request was made but no response received
          throw new ApiError('Network error, no response received', 0);
        } else {
          // Something happened in setting up the request
          throw new ApiError(`Request configuration error: ${error.message}`, 0);
        }
      }
    );
  }

  // Helper methods for API calls
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Specific API methods aligned with OpenAPI schema
  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return this.post<{access_token: string; token_type: string}>('/auth/jwt/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  async getPageForEditor(pageId: string) {
    return this.get(`/api/v1/pages/${pageId}`);
  }

  async updatePageComponentProps(instanceId: string, propsData: Record<string, any>) {
    return this.put(`/api/v1/pages/components/${instanceId}`, {
      props_data: propsData
    });
  }

  async getPageComponents(pageId: string) {
    return this.get(`/api/v1/pages/${pageId}/components`);
  }
}

// Singleton instance
const apiClient = new ApiClient();
export default apiClient;