import { Book } from "@/data/books";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface ContinueReadingProps {
  book: Book;
}

export const ContinueReading = ({ book }: ContinueReadingProps) => {
  const navigate = useNavigate();
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (book.progress / 100) * circumference;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-gold" />
        <h2 className="text-sm font-semibold text-gold uppercase tracking-wider">
          Continuar Leyendo
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Book Cover */}
        <div className="relative flex-shrink-0">
          <img
            src={book.cover}
            alt={book.title}
            className="w-20 h-28 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg line-clamp-1">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            {book.author}
          </p>
          <p className="text-xs text-gold">
            Recomendado por {book.recommendedBy}
          </p>
        </div>

        {/* Circular Progress */}
        <div className="relative flex-shrink-0 w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">
              {book.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Start Reading Button */}
      <button
        onClick={() => navigate(`/read/${book.id}`)}
        className="mt-5 w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] touch-manipulation text-lg shadow-lg shadow-primary/30"
      >
        Comenzar Lectura
      </button>
    </div>
  );
};
