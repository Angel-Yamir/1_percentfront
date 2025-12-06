// src/pages/BookDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Clock, BookOpen, CheckCircle, Sparkles, FileText } from "lucide-react";
import { getBookById, type Book } from "@/data/books";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsService } from "@/services/api";
import ReviewsSection from "@/components/ReviewsSection";
import { toast } from "sonner";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    if (!id) return;

    try {
      const bookData = await getBookById(id);
      if (bookData) {
        setBook(bookData);

        if (isAuthenticated) {
          try {
            const library = await analyticsService.getMyLibrary();
            const hasBook = library.some(p => p.libro === parseInt(id));
            setIsDownloaded(hasBook);
          } catch (error) {
            console.error('Error checking download status:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Error al cargar el libro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!book) return;

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para descargar libros');
      navigate('/login');
      return;
    }

    setIsDownloading(true);

    try {
      // Registrar descarga
      await analyticsService.registerDownload(parseInt(book.id));

      // Descargar PDF (preferencia) o EPUB
      const downloadUrl = book.pdfUrl || book.epubUrl;
      const fileExtension = book.pdfUrl ? 'pdf' : 'epub';

      if (!downloadUrl) {
        toast.error('No hay archivo disponible para descargar');
        setIsDownloading(false);
        return;
      }

      // Crear link de descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${book.title}.${fileExtension}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloaded(true);
      toast.success(`¡Descarga iniciada! Libro en formato ${fileExtension.toUpperCase()}`);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Error al descargar el libro');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Libro no encontrado</p>
          <Button onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  // Determinar formato disponible
  const availableFormat = book.pdfUrl ? 'PDF' : 'EPUB';
  const hasMultipleFormats = book.pdfUrl && book.epubUrl;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate">{book.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Weekly Launch Banner */}
        <Card className="p-4 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-gold/30">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-gold flex-shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-semibold text-gold">✨ Estreno:</span> Lanzamos un libro nuevo cada semana en formatos EPUB y PDF
            </p>
          </div>
        </Card>

        {/* Book Hero */}
        <div className="flex gap-6">
          <div className="w-32 sm:w-40 flex-shrink-0">
            <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-bold leading-tight">{book.title}</h2>
            <p className="text-muted-foreground">por {book.author}</p>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-gold font-medium">Recomendado por:</span>
              <span>{book.recommendedBy}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>12 horas</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{book.totalPages} páginas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Format Badge */}
        <Card className="p-3 bg-primary/10 border-primary/30">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Formato disponible: <span className="text-primary">{availableFormat}</span>
              </p>
              {hasMultipleFormats && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  También disponible en {availableFormat === 'PDF' ? 'EPUB' : 'PDF'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`w-full py-6 text-lg font-semibold ${
            isDownloaded 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Descargando...
            </>
          ) : isDownloaded ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Descargado - Descargar de Nuevo
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Descargar Libro ({availableFormat})
            </>
          )}
        </Button>

        {/* Book Description */}
        {book.description && (
          <Card className="p-6 bg-card/30 border-border">
            <h3 className="text-lg font-semibold mb-3">Sobre este libro</h3>
            <p className="text-muted-foreground leading-relaxed">
              {book.description}
            </p>
          </Card>
        )}

        {/* Quote */}
        {book.mentorQuote && (
          <Card className="p-6 bg-muted/20 border-border">
            <div className="flex items-start gap-3">
              <div className="text-4xl text-gold">"</div>
              <blockquote className="text-lg italic text-foreground/90 leading-relaxed">
                {book.mentorQuote}
              </blockquote>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              — {book.recommendedBy}, {book.recommenderRole}
            </p>
          </Card>
        )}

        {/* Reviews Section */}
        <ReviewsSection bookId={book.id} />
      </main>
    </div>
  );
};

export default BookDetail;