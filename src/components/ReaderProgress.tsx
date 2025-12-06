interface ReaderProgressProps {
  percentage: number;
  visible: boolean;
}

export const ReaderProgress = ({ percentage, visible }: ReaderProgressProps) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 safe-bottom transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gold min-w-[50px] text-right">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
