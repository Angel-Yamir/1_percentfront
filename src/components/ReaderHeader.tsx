import { ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReaderHeaderProps {
  title: string;
  visible: boolean;
}

export const ReaderHeader = ({ title, visible }: ReaderHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-top transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 touch-manipulation hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        
        <h1 className="text-sm font-medium text-foreground truncate max-w-[200px]">
          {title}
        </h1>

        <button className="p-2 -mr-2 touch-manipulation hover:bg-muted rounded-lg transition-colors">
          <Settings className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};
