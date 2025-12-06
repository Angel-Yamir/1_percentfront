// ==========================================
// ARCHIVO 3: src/services/api/booksService.ts
// ==========================================
import { apiClient, handleApiError } from './config';

export interface Mentor {
  id: number;
  nombre: string;
  foto: string | null;
  ocupacion: string;
  frase_celebre: string;
}

export interface Book {
  id: number;
  titulo: string;
  autor: string;
  descripcion: string;
  portada: string;
  archivo_epub: string | null;
  archivo_pdf: string | null;
  total_paginas: number;
  mentor: number;
  mentor_detalle: Mentor;
  resena_mentor: string;
  es_libro_semana: boolean;
  fecha_lanzamiento?: string;
}

class BooksService {
  // Obtener todos los libros
  async getAllBooks(): Promise<Book[]> {
    try {
      const response = await apiClient.get<Book[]>('/library/books/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Obtener libro por ID
  async getBookById(id: number): Promise<Book> {
    try {
      const response = await apiClient.get<Book>(`/library/books/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Obtener libro de la semana
  async getWeeklyBook(): Promise<Book> {
    try {
      const response = await apiClient.get<Book>('/library/books/weekly/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const booksService = new BooksService();

