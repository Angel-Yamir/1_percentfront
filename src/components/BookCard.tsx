import { Book } from "@/data/books";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/read/${book.id}`)}
      className="group flex flex-col items-center touch-manipulation transition-transform active:scale-95"
    >
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg shadow-black/50 transition-all duration-300 group-hover:shadow-gold/20 group-hover:scale-105">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {book.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        )}
      </div>
      <h3 className="mt-3 text-sm font-medium text-foreground text-center line-clamp-2 group-hover:text-gold transition-colors">
        {book.title}
      </h3>
      <p className="text-xs text-muted-foreground text-center">
        {book.author}
      </p>
    </button>
  );
};
