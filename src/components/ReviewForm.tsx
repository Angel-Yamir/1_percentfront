import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import StarRating from "./StarRating";
import { toast } from "sonner";

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
}

const ReviewForm = ({ onSubmit }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Por favor, selecciona una calificación");
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error("Tu reseña debe tener al menos 10 caracteres");
      return;
    }

    onSubmit(rating, comment.trim());
    setRating(0);
    setComment("");
    toast.success("¡Reseña publicada exitosamente!");
  };

  return (
    <Card className="p-6 bg-card/30 border-border">
      <h3 className="text-lg font-semibold mb-4">Tu Opinión</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Calificación
          </label>
          <StarRating rating={rating} onRate={setRating} size="lg" />
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Escribe tu reseña
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué te pareció este libro? Comparte tu experiencia..."
            className="min-h-[100px] bg-background/50 border-border resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {comment.length}/500
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
        >
          Publicar Comentario
        </Button>
      </form>
    </Card>
  );
};

export default ReviewForm;
