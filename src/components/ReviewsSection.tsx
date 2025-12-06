// src/components/ReviewsSection.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { socialService, type Review } from "@/services/api";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ReviewsSectionProps {
  bookId: string;
}

const ReviewsSection = ({ bookId }: ReviewsSectionProps) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [bookId]);

  const loadReviews = async () => {
    try {
      const bookReviews = await socialService.getBookReviews(parseInt(bookId));
      setReviews(bookReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Error al cargar las reseñas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para dejar una reseña');
      return;
    }

    try {
      await socialService.createReview({
        libro: parseInt(bookId),
        calificacion: rating,
        comentario: comment,
      });
      
      toast.success('¡Reseña publicada exitosamente!');
      
      // Recargar reseñas
      await loadReviews();
    } catch (error: any) {
      console.error('Error creating review:', error);
      toast.error(error.message || 'Error al publicar la reseña');
    }
  };

  // Separar reseñas destacadas (primeras 2 que no sean del usuario actual)
  const featuredReviews = reviews
    .filter(r => r.usuario_nombre !== user?.username)
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Reviews */}
      {featuredReviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-gold">👑</span>
            <h2 className="text-xl font-bold">Comentarios de la Élite</h2>
          </div>
          <div className="grid gap-4">
            {featuredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} featured />
            ))}
          </div>
        </div>
      )}

      {/* Review Form - Solo si está autenticado */}
      {isAuthenticated ? (
        <ReviewForm onSubmit={handleSubmitReview} />
      ) : (
        <div className="p-6 bg-muted/20 border border-border rounded-lg text-center">
          <p className="text-muted-foreground">
            Inicia sesión para dejar tu reseña
          </p>
        </div>
      )}

      {/* All Reviews */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Muro de Comentarios ({reviews.length})
          </h3>
        </div>
        
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Sé el primero en compartir tu opinión
          </p>
        ) : (
          <div className="grid gap-3">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review}
                isCurrentUser={review.usuario_nombre === user?.username}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;