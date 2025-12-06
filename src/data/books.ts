// src/data/books.ts
import { booksService, type Book as ApiBook } from '@/services/api';

// Adaptador: Convierte el formato de la API al formato de tu app
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  epubUrl: string;
  pdfUrl?: string;
  recommendedBy: string;
  recommenderRole: string;
  description?: string;
  totalPages: number;
  mentorQuote?: string;
  progress: number;
  currentLocation?: string;
}

// Función helper para convertir libro de API a formato local
export const adaptApiBook = (apiBook: ApiBook, progress: number = 0): Book => {
  return {
    id: apiBook.id.toString(),
    title: apiBook.titulo,
    author: apiBook.autor,
    cover: apiBook.portada,
    epubUrl: apiBook.archivo_epub || '',
    pdfUrl: apiBook.archivo_pdf || undefined,
    recommendedBy: apiBook.mentor_detalle?.nombre || 'Desconocido',
    recommenderRole: apiBook.mentor_detalle?.ocupacion || '',
    description: apiBook.descripcion,
    totalPages: apiBook.total_paginas,
    mentorQuote: apiBook.mentor_detalle?.frase_celebre,
    progress,
    currentLocation: undefined,
  };
};

// Cache local (opcional, para evitar múltiples llamadas)
let booksCache: Book[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Obtener todos los libros
export const getBooks = async (): Promise<Book[]> => {
  try {
    // Si hay cache válido, retornarlo
    const now = Date.now();
    if (booksCache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      return booksCache;
    }

    // Obtener de la API
    const apiBooks = await booksService.getAllBooks();
    booksCache = apiBooks.map(book => adaptApiBook(book));
    lastFetchTime = now;
    
    return booksCache;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

// Obtener libro por ID
export const getBookById = async (id: string): Promise<Book | undefined> => {
  try {
    const apiBook = await booksService.getBookById(parseInt(id));
    return adaptApiBook(apiBook);
  } catch (error) {
    console.error('Error fetching book:', error);
    return undefined;
  }
};

// Obtener libro de la semana
export const getWeeklyBook = async (): Promise<Book | undefined> => {
  try {
    const apiBook = await booksService.getWeeklyBook();
    return adaptApiBook(apiBook);
  } catch (error) {
    console.error('Error fetching weekly book:', error);
    return undefined;
  }
};

// Limpiar cache (útil después de actualizaciones)
export const clearBooksCache = () => {
  booksCache = [];
  lastFetchTime = 0;
};

// Exportar array vacío por compatibilidad (ya no se usa)
export const books: Book[] = [];

// Mantener getCurrentBook para compatibilidad
export const getCurrentBook = async (): Promise<Book | undefined> => {
  const allBooks = await getBooks();
  return allBooks.find(book => book.progress > 0) || allBooks[0];
};