// src/pages/Index.tsx
import Header from "@/components/Header";
import BookChallenge from "@/components/BookChallenge";
import ProgressCard from "@/components/ProgressCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4 text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Transforma tu vida,
              <span className="text-gradient-elite"> un libro a la vez</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Lee los libros que transformaron a presidentes, multimillonarios e innovadores.
              Únete a la élite del 1% de lectores comprometidos.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 pt-8">
            <div className="lg:col-span-2">
              <BookChallenge />
            </div>
            <div className="lg:col-span-1">
              <ProgressCard />
            </div>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-elite/10 border border-border rounded-lg">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">¿Por qué el 1%?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                El 1% de las personas más exitosas del mundo comparten un hábito en común:
                la lectura constante. Warren Buffett lee 500 páginas al día. Bill Gates lee
                50 libros al año. Únete a este selecto grupo y desarrolla el hábito que
                separa a los extraordinarios de lo ordinario.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
