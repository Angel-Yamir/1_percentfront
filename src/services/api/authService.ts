// ==========================================
// ARCHIVO 2: src/services/api/authService.ts
// ==========================================
import { apiClient, handleApiError } from './config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar: string | null;
  puntos_totales: number;
  rango_actual: string;
}

class AuthService {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<AuthTokens>('/users/login/', credentials);
      
      // Guardar tokens en localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Registro
  async register(data: RegisterData): Promise<UserProfile> {
    try {
      const response = await apiClient.post<UserProfile>('/users/register/', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Obtener perfil del usuario actual
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>('/users/me/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/users/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
