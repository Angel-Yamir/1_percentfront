// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, BookOpen, Library } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsService, type BookProgress } from "@/services/api";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [library, setLibrary] = useState<BookProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const myLibrary = await analyticsService.getMyLibrary();
      setLibrary(myLibrary);
    } catch (error) {
      console.error('Error loading library:', error);
      toast.error('Error al cargar tu biblioteca');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadedBooks = library.length;
  const booksInProgress = library.filter(b => b.estado === 'EN_PROGRESO').length;
  const finishedBooks = library.filter(b => b.estado === 'FINALIZADO').length;

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-xl font-bold">Mi Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* User Info Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-card border-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.username}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
                🏆 {user?.rango_actual || 'Iniciado'}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-primary/20 to-card border-primary/30">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{downloadedBooks}</p>
              <p className="text-xs text-muted-foreground">Descargados</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-gold/20 to-card border-gold/30">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-gold" />
              </div>
              <p className="text-2xl font-bold text-foreground">{booksInProgress}</p>
              <p className="text-xs text-muted-foreground">Leyendo</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-card border-green-500/30">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{finishedBooks}</p>
              <p className="text-xs text-muted-foreground">Terminados</p>
            </div>
          </Card>
        </div>

        {/* Points Card */}
        <Card className="p-6 bg-card/50 border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Puntos Totales</p>
              <p className="text-3xl font-bold text-gold">{user?.puntos_totales || 0}</p>
            </div>
            <div className="text-5xl">🏆</div>
          </div>
        </Card>

        {/* Downloaded Books History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-gold" />
            <h2 className="text-xl font-bold">Mi Biblioteca</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : library.length === 0 ? (
            <Card className="p-8 bg-card/50 border-border text-center">
              <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Aún no has descargado ningún libro
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-primary hover:bg-primary/90"
              >
                Explorar Biblioteca
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {library.map((progress) => (
                <Card
                  key={progress.id}
                  className="overflow-hidden bg-card/50 border-border group cursor-pointer"
                  onClick={() => navigate(`/book/${progress.libro}`)}
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={progress.libro_detalle.portada}
                      alt={progress.libro_detalle.titulo}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Progress Badge */}
                    <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded">
                      {Math.round(progress.porcentaje_avance)}%
                    </div>

                    {/* Book Info */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-medium text-white truncate">
                        {progress.libro_detalle.titulo}
                      </p>
                      <p className="text-xs text-white/70 truncate">
                        {progress.libro_detalle.autor}
                      </p>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="p-2 bg-card">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${
                        progress.estado === 'FINALIZADO' ? 'text-green-500' :
                        progress.estado === 'EN_PROGRESO' ? 'text-gold' :
                        'text-muted-foreground'
                      }`}>
                        {progress.estado === 'FINALIZADO' ? 'Terminado' :
                         progress.estado === 'EN_PROGRESO' ? 'Leyendo' :
                         'Descargado'}
                      </span>
                      <span className="text-muted-foreground">
                        {progress.paginas_leidas}/{progress.libro_detalle.total_paginas}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;