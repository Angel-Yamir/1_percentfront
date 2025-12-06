// src/components/ReviewCard.tsx
import { Card } from "@/components/ui/card";
import StarRating from "./StarRating";
import { type Review } from "@/services/api";

interface ReviewCardProps {
  review: Review;
  featured?: boolean;
  isCurrentUser?: boolean;
}

const ReviewCard = ({ review, featured = false, isCurrentUser = false }: ReviewCardProps) => {
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className={`p-4 bg-card/50 border-border ${featured ? 'border-gold/30' : ''} ${isCurrentUser ? 'border-primary/30' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-foreground">
            {review.usuario_nombre}
            {isCurrentUser && (
              <span className="ml-2 text-xs text-primary">(Tú)</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(review.fecha_creacion)}
          </p>
        </div>
        <StarRating rating={review.calificacion} readonly size="sm" />
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{review.comentario}</p>
      {featured && (
        <div className="mt-3 flex items-center gap-1 text-gold text-xs font-medium">
          <span>⭐</span> Reseña Destacada
        </div>
      )}
    </Card>
  );
};

export default ReviewCard;