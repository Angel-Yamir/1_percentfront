// src/components/BookReader.tsx
import { useState, useCallback, useRef, useEffect } from "react";
import { ReactReader } from "react-reader";
import type { Contents, Rendition } from "epubjs";
import { Book } from "@/data/books";
import { ReaderHeader } from "./ReaderHeader";
import { ReaderProgress } from "./ReaderProgress";
import { useDebounce } from "@/hooks/useDebounce";
import { analyticsService } from "@/services/api";

interface BookReaderProps {
  book: Book;
}

export const BookReader = ({ book }: BookReaderProps) => {
  const [location, setLocation] = useState<string | number>(
    book.currentLocation || 0
  );
  const [percentage, setPercentage] = useState(book.progress);
  const [showUI, setShowUI] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const renditionRef = useRef<Rendition | null>(null);
  const tocRef = useRef<any[]>([]);

  // Sincronizar progreso con el backend
  const syncProgressToBackend = useCallback(async (pages: number) => {
    try {
      await analyticsService.updateProgress(parseInt(book.id), pages);
      console.log('✅ Progreso sincronizado:', pages, 'páginas');
    } catch (error) {
      console.error('❌ Error syncing progress:', error);
    }
  }, [book.id]);

  // Debounce para no saturar el backend
  const debouncedSync = useDebounce(syncProgressToBackend, 3000);

  const locationChanged = useCallback(
    (epubcifi: string) => {
      setLocation(epubcifi);

      if (renditionRef.current && tocRef.current.length > 0) {
        const currentLocation = renditionRef.current.location;
        if (currentLocation) {
          const start = currentLocation.start;
          if (start && typeof start.percentage === "number") {
            const pct = Math.round(start.percentage * 100);
            setPercentage(pct);

            // Calcular página aproximada basada en porcentaje
            const estimatedPage = Math.round((pct / 100) * book.totalPages);
            setCurrentPage(estimatedPage);

            // Sincronizar con backend (debounced)
            debouncedSync(estimatedPage);
          }
        }
      }
    },
    [debouncedSync, book.totalPages]
  );

  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX } = e;
    const screenWidth = window.innerWidth;
    const tapZone = screenWidth / 3;

    // Middle zone toggles UI
    if (clientX > tapZone && clientX < screenWidth - tapZone) {
      setShowUI((prev) => !prev);
      return;
    }

    // Left zone - previous page
    if (clientX <= tapZone && renditionRef.current) {
      renditionRef.current.prev();
    }

    // Right zone - next page
    if (clientX >= screenWidth - tapZone && renditionRef.current) {
      renditionRef.current.next();
    }
  }, []);

  const getRendition = useCallback((rendition: Rendition) => {
    renditionRef.current = rendition;

    // Apply dark theme styles
    rendition.themes.register("dark", {
      body: {
        background: "#0d0d0d !important",
        color: "#e8e4dc !important",
        "font-family": "'Merriweather', Georgia, serif !important",
        "line-height": "1.8 !important",
        padding: "0 16px !important",
      },
      a: {
        color: "#ffd700 !important",
      },
      p: {
        "margin-bottom": "1em !important",
      },
    });

    rendition.themes.select("dark");

    // Enable keyboard navigation
    rendition.on("keyup", (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") rendition.prev();
      if (e.key === "ArrowRight") rendition.next();
    });
  }, []);

  const handleTocLoaded = useCallback((toc: any[]) => {
    tocRef.current = toc;
  }, []);

  // Sincronizar progreso final al salir
  useEffect(() => {
    return () => {
      if (currentPage > 0) {
        syncProgressToBackend(currentPage);
      }
    };
  }, [currentPage, syncProgressToBackend]);

  return (
    <div
      onClick={handleTap}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100vh",
        width: "100vw",
        background: "#0d0d0d",
      }}
      className="touch-manipulation"
    >
      <ReaderHeader title={book.title} visible={showUI} />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: "100vh",
          width: "100vw",
        }}
      >
        <ReactReader
          url={book.epubUrl}
          location={location}
          locationChanged={locationChanged}
          getRendition={getRendition}
          tocChanged={handleTocLoaded}
          showToc={false}
          epubOptions={{
            flow: "paginated",
            manager: "continuous",
          }}
        />
      </div>

      <ReaderProgress percentage={percentage} visible={showUI} />
    </div>
  );
};