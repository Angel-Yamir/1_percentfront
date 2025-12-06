// ==========================================
// ARCHIVO 5: src/services/api/socialService.ts
// ==========================================
import { apiClient, handleApiError } from './config';

export interface Review {
  id: number;
  usuario_nombre: string;
  libro: number;
  calificacion: number;
  comentario: string;
  fecha_creacion: string;
}

export interface CreateReviewData {
  libro: number;
  calificacion: number;
  comentario: string;
}

class SocialService {
  // Crear reseña
  async createReview(data: CreateReviewData): Promise<Review> {
    try {
      const response = await apiClient.post<Review>('/social/create/', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Obtener reseñas de un libro
  async getBookReviews(bookId: number): Promise<Review[]> {
    try {
      const response = await apiClient.get<Review[]>(`/social/book/${bookId}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const socialService = new SocialService();
