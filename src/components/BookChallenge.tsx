// src/components/BookChallenge.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Clock, BookOpen, Award, Sparkles, CheckCircle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getWeeklyBook, type Book } from "@/data/books";
import { analyticsService } from "@/services/api";
import { toast } from "sonner";

const BookChallenge = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [weeklyBook, setWeeklyBook] = useState<Book | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadWeeklyBook();
  }, []);

  const loadWeeklyBook = async () => {
    try {
      const book = await getWeeklyBook();
      if (book) {
        setWeeklyBook(book);
        
        if (isAuthenticated) {
          try {
            const library = await analyticsService.getMyLibrary();
            const hasBook = library.some(p => p.libro === parseInt(book.id));
            setIsDownloaded(hasBook);
          } catch (error) {
            console.error('Error checking download status:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading weekly book:', error);
      toast.error('Error al cargar el libro de la semana');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!weeklyBook) return;

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para descargar libros');
      navigate('/login');
      return;
    }

    setIsDownloading(true);

    try {
      // Registrar descarga en el backend
      await analyticsService.registerDownload(parseInt(weeklyBook.id));

      // Descargar PDF (preferencia) o EPUB si no hay PDF
      let downloadUrl = weeklyBook.pdfUrl || weeklyBook.epubUrl; // Usamos 'let' para poder modificarlo
      const fileExtension = weeklyBook.pdfUrl ? 'pdf' : 'epub';

      if (!downloadUrl) {
        toast.error('No hay archivo disponible para descargar');
        setIsDownloading(false);
        return;
      }

      // 🔒 PARCHE DE SEGURIDAD PARA IPHONE/IOS
      // Forzamos HTTPS para evitar bloqueo de "Mixed Content"
      if (downloadUrl.startsWith('http://')) {
        downloadUrl = downloadUrl.replace('http://', 'https://');
      }

      // Crear link de descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${weeklyBook.title}.${fileExtension}`;
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
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (!weeklyBook) {
    return (
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border">
        <p className="text-center text-muted-foreground">
          No hay libro de la semana disponible
        </p>
      </Card>
    );
  }

  // Determinar qué formato está disponible
  const availableFormat = weeklyBook.pdfUrl ? 'PDF' : 'EPUB';
  const hasMultipleFormats = weeklyBook.pdfUrl && weeklyBook.epubUrl;

  return (
    <Card className="p-6 sm:p-8 bg-gradient-to-br from-card to-card/50 border-border">
      <div className="space-y-6">
        {/* Weekly Launch Banner */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gold/10 border border-gold/30">
          <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold text-gold">✨ Estreno:</span> Lanzamos un libro nuevo cada semana en formatos EPUB y PDF
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gold text-sm font-semibold tracking-wider">
            <Award className="w-4 h-4" />
            LIBRO DE LA SEMANA
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {weeklyBook.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            por <span className="text-foreground font-semibold">{weeklyBook.author}</span>
          </p>
        </div>

        {/* Mentor Quote */}
        {weeklyBook.mentorQuote && (
          <div className="p-4 sm:p-6 bg-muted/30 border border-border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-3xl sm:text-4xl text-gold">"</div>
              <blockquote className="text-base sm:text-lg italic text-foreground/90 leading-relaxed">
                {weeklyBook.mentorQuote}
              </blockquote>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              — {weeklyBook.recommendedBy}, {weeklyBook.recommenderRole}
            </p>
          </div>
        )}

        {/* Book Description */}
        {weeklyBook.description && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sobre este libro</h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {weeklyBook.description}
            </p>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-sm">12 horas de lectura</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm">{weeklyBook.totalPages} páginas</span>
              </div>
            </div>
          </div>
        )}

        {/* Format Badge */}
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <FileText className="w-5 h-5 text-primary" />
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
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
          
          <Button
            variant="outline"
            onClick={() => navigate(`/book/${weeklyBook.id}`)}
            className="w-full py-5 border-gold/30 text-gold hover:bg-gold/10"
          >
            Ver Detalles y Reseñas
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BookChallenge;