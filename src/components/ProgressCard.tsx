// src/components/ProgressCard.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsService } from "@/services/api";
import ProgressModal from "./ProgressModal";

const ProgressCard = () => {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState({
    currentPage: 0,
    totalPages: 592,
    percentage: 0,
    bookId: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadProgress();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadProgress = async () => {
    try {
      const library = await analyticsService.getMyLibrary();
      
      // Obtener el libro con mayor progreso o el primero
      const bookWithProgress = library.find(b => b.porcentaje_avance > 0) || library[0];
      
      if (bookWithProgress) {
        setProgress({
          currentPage: bookWithProgress.paginas_leidas,
          totalPages: bookWithProgress.libro_detalle.total_paginas,
          percentage: Math.round(bookWithProgress.porcentaje_avance),
          bookId: bookWithProgress.libro,
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressUpdate = async () => {
    // Recargar progreso después de actualizar
    await loadProgress();
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border">
        <div className="text-center space-y-4">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-xl font-bold mb-2">Inicia Sesión</h3>
            <p className="text-muted-foreground text-sm">
              Inicia sesión para ver tu progreso y estadísticas
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-elite text-sm font-semibold tracking-wider">
          <TrendingUp className="w-4 h-4" />
          TU PROGRESO
        </div>
        <h3 className="text-2xl font-bold">Panel de Evolución</h3>
      </div>

      <div className="space-y-6">
        {/* Circular Progress */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="hsl(var(--progress))"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress.percentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gradient-elite">
                {progress.percentage}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Completado
              </div>
            </div>
          </div>
          
          {/* Page indicator */}
          <div className="mt-4 text-sm text-muted-foreground">
            Página <span className="text-foreground font-medium">{progress.currentPage}</span> de <span className="text-foreground font-medium">{progress.totalPages}</span>
          </div>
          
          {/* Update progress button */}
          {progress.bookId > 0 && (
            <div className="mt-4">
              <ProgressModal 
                bookId={progress.bookId.toString()} 
                totalPages={progress.totalPages}
                onUpdate={handleProgressUpdate}
              />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Puntos Totales</span>
              <Trophy className="w-4 h-4 text-elite" />
            </div>
            <div className="text-3xl font-bold">{user?.puntos_totales || 0}</div>
          </div>

          {/* Rank System */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Sistema de Rangos
            </div>
            <div className="p-4 bg-primary/10 border border-primary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{user?.rango_actual || 'Iniciado'}</div>
                  <div className="text-sm text-muted-foreground">Rango Actual</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressCard;