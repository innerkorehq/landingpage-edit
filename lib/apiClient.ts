import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError, Page, PageComponentInstance } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          status: error.response?.status || 500,
          message: error.response?.data?.detail || error.message || 'Unknown error occurred',
          data: error.response?.data
        };
        
        // Handle auth errors (401)
        if (apiError.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        
        return Promise.reject(apiError);
      }
    );
  }
  
  // Get page data for editor
  async getPageForEditor(pageId: string): Promise<Page> {
    try {
      const pageResponse = await this.client.get<Page>(`/api/v1/pages/${pageId}`);
      const componentsResponse = await this.client.get<PageComponentInstance[]>(`/api/v1/pages/${pageId}/components`);
      
      // Combine page with its components
      const page = pageResponse.data;
      page.components = componentsResponse.data;
      
      // Get component variations for each instance
      for (const component of page.components) {
        const variationResponse = await this.client.get(`/api/v1/components/variations/${component.component_variation_id}`);
        component.component_variation = variationResponse.data;
      }
      
      return page;
    } catch (error) {
      this.handleError(error as Error | AxiosError, 'Failed to load page data');
      throw error;
    }
  }
  
  // Update component props
  async updatePageComponentProps(instanceId: string, propsData: Record<string, any>): Promise<PageComponentInstance> {
    try {
      const response = await this.client.put(`/api/v1/pages/components/${instanceId}`, {
        props_data: propsData
      });
      return response.data;
    } catch (error) {
      this.handleError(error as Error | AxiosError, 'Failed to update component properties');
      throw error;
    }
  }
  
  // Central error handler
  private handleError(error: Error | AxiosError, defaultMessage: string): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        status: axiosError.response?.status || 500,
        message: axiosError.response?.data?.detail || defaultMessage,
        data: axiosError.response?.data
      };
    } else {
      return {
        status: 500,
        message: error.message || defaultMessage
      };
    }
  }
}

// Create a singleton instance
const apiClient = new ApiClient();
export default apiClient;
export type { ApiError };