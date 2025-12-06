// ==========================================
// ARCHIVO 4: src/services/api/analyticsService.ts
// ==========================================
import { apiClient, handleApiError } from './config';
import { Book } from './booksService';

export interface BookProgress {
  id: number;
  usuario: number;
  libro: number;
  libro_detalle: Book;
  estado: 'DESCARGADO' | 'EN_PROGRESO' | 'FINALIZADO';
  paginas_leidas: number;
  porcentaje_avance: number;
}

export interface DownloadResponse {
  status: string;
  progreso_id: number;
  nuevo_registro: boolean;
}

export interface UpdateProgressResponse {
  libro: string;
  paginas_leidas: number;
  porcentaje: number;
  estado: string;
}

class AnalyticsService {
  // Registrar descarga de libro
  async registerDownload(bookId: number): Promise<DownloadResponse> {
    try {
      const response = await apiClient.post<DownloadResponse>(
        `/analytics/download/${bookId}/`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Actualizar progreso de lectura
  async updateProgress(
    bookId: number, 
    paginasLeidas: number
  ): Promise<UpdateProgressResponse> {
    try {
      const response = await apiClient.post<UpdateProgressResponse>(
        `/analytics/update/${bookId}/`,
        { paginas_leidas: paginasLeidas }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Obtener mis libros (biblioteca personal)
  async getMyLibrary(): Promise<BookProgress[]> {
    try {
      const response = await apiClient.get<BookProgress[]>('/analytics/my-library/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const analyticsService = new AnalyticsService();
