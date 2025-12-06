// src/components/ProgressModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import { analyticsService } from "@/services/api";
import { toast } from "sonner";

interface ProgressModalProps {
  bookId: string;
  totalPages: number;
  trigger?: React.ReactNode;
  onUpdate?: () => void;
}

const ProgressModal = ({ bookId, totalPages, trigger, onUpdate }: ProgressModalProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar progreso actual al abrir
  useEffect(() => {
    if (open) {
      loadCurrentProgress();
    }
  }, [open, bookId]);

  const loadCurrentProgress = async () => {
    setIsLoading(true);
    try {
      const library = await analyticsService.getMyLibrary();
      const bookProgress = library.find(p => p.libro === parseInt(bookId));
      
      if (bookProgress) {
        setCurrentPage(bookProgress.paginas_leidas);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (currentPage < 0) {
      toast.error("La página no puede ser negativa");
      return;
    }
    if (currentPage > totalPages) {
      toast.error(`El libro solo tiene ${totalPages} páginas`);
      return;
    }
    
    setIsSaving(true);

    try {
      await analyticsService.updateProgress(parseInt(bookId), currentPage);
      toast.success(`¡Progreso actualizado! Página ${currentPage} de ${totalPages}`);
      setOpen(false);
      
      // Notificar al componente padre
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error(error.message || 'Error al actualizar el progreso');
    } finally {
      setIsSaving(false);
    }
  };

  const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
            <BookOpen className="w-4 h-4 mr-2" />
            Actualizar Progreso
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Actualizar Progreso de Lectura</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="currentPage" className="text-base font-medium">
                ¿En qué página vas?
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="currentPage"
                  type="number"
                  min={0}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-lg font-semibold text-center bg-muted/50 border-border"
                  disabled={isSaving}
                />
                <span className="text-muted-foreground whitespace-nowrap">
                  / {totalPages} páginas
                </span>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progreso calculado:</span>
                <span className="text-2xl font-bold text-gold">{percentage}%</span>
              </div>
              <div className="mt-3 w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full py-5 bg-primary hover:bg-primary/90 font-semibold"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar Progreso'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProgressModal;