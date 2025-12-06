// src/hooks/useUserStore.ts
import { useState, useEffect } from 'react';
import { 
  authService, 
  analyticsService, 
  socialService,
  type UserProfile,
  type BookProgress,
  type Review
} from '@/services/api';

interface UserData {
  profile: UserProfile | null;
  downloadedBooks: BookProgress[];
  reviews: Review[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: UserData = {
  profile: null,
  downloadedBooks: [],
  reviews: [],
  isAuthenticated: false,
  isLoading: true,
};

export const useUserStore = () => {
  const [userData, setUserData] = useState<UserData>(initialState);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      if (!authService.isAuthenticated()) {
        setUserData({ ...initialState, isLoading: false });
        return;
      }

      // Cargar perfil
      const profile = await authService.getProfile();
      
      // Cargar biblioteca
      const library = await analyticsService.getMyLibrary();

      setUserData({
        profile,
        downloadedBooks: library,
        reviews: [], // Las reviews se cargan por libro
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserData({ ...initialState, isLoading: false });
    }
  };

  // Login
  const login = async (username: string, password: string) => {
    try {
      await authService.login({ username, password });
      await loadUserData();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      setUserData({ ...initialState, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Registrar descarga
  const registerDownload = async (bookId: number) => {
    try {
      await analyticsService.registerDownload(bookId);
      // Recargar biblioteca
      const library = await analyticsService.getMyLibrary();
      setUserData(prev => ({
        ...prev,
        downloadedBooks: library,
      }));
      return true;
    } catch (error) {
      console.error('Download registration error:', error);
      throw error;
    }
  };

  // Verificar si un libro está descargado
  const hasDownloaded = (bookId: number): boolean => {
    return userData.downloadedBooks.some(
      progress => progress.libro === bookId
    );
  };

  // Actualizar progreso de lectura
  const updateProgress = async (bookId: number, paginasLeidas: number) => {
    try {
      await analyticsService.updateProgress(bookId, paginasLeidas);
      // Recargar biblioteca
      const library = await analyticsService.getMyLibrary();
      setUserData(prev => ({
        ...prev,
        downloadedBooks: library,
      }));
      return true;
    } catch (error) {
      console.error('Progress update error:', error);
      throw error;
    }
  };

  // Obtener progreso de un libro
  const getBookProgress = (bookId: number) => {
    return userData.downloadedBooks.find(
      progress => progress.libro === bookId
    );
  };

  // Agregar reseña
  const addReview = async (
    bookId: number, 
    calificacion: number, 
    comentario: string
  ) => {
    try {
      await socialService.createReview({
        libro: bookId,
        calificacion,
        comentario,
      });
      return true;
    } catch (error) {
      console.error('Review creation error:', error);
      throw error;
    }
  };

  // Obtener reseñas de un libro
  const getBookReviews = async (bookId: number): Promise<Review[]> => {
    try {
      const reviews = await socialService.getBookReviews(bookId);
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  };

  return {
    userData,
    login,
    logout,
    registerDownload,
    hasDownloaded,
    updateProgress,
    getBookProgress,
    addReview,
    getBookReviews,
    refreshData: loadUserData,
  };
};