// src/pages/ReadBook.tsx
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getBookById, type Book } from "@/data/books";
import { BookReader } from "@/components/BookReader";
import { analyticsService } from "@/services/api";
import { toast } from "sonner";

const ReadBook = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    if (!id) return;

    try {
      // Cargar datos del libro
      const bookData = await getBookById(id);
      if (!bookData) {
        toast.error('Libro no encontrado');
        setIsLoading(false);
        return;
      }

      // Cargar progreso del usuario
      try {
        const library = await analyticsService.getMyLibrary();
        const bookProgress = library.find(p => p.libro === parseInt(id));
        
        if (bookProgress) {
          // Combinar datos del libro con progreso
          setBook({
            ...bookData,
            progress: Math.round(bookProgress.porcentaje_avance),
            // Aquí podrías cargar la ubicación del EPUB si la guardas
          });
        } else {
          setBook(bookData);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
        setBook(bookData);
      }
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Error al cargar el libro');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando libro...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return <Navigate to="/" replace />;
  }

  return <BookReader book={book} />;
};

export default ReadBook;