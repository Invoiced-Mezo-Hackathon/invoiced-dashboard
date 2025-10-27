import { CheckCircle2, Loader2 } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved';
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-foreground/60">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Saved</span>
        </>
      )}
      {status === 'idle' && (
        <span className="text-foreground/40 text-xs">Auto-save enabled</span>
      )}
    </div>
  );
}

