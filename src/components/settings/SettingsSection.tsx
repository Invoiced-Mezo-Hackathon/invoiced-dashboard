import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  iconBgColor = 'bg-blue-500/10',
  iconColor = 'text-blue-400',
  defaultOpen = true,
  children,
}: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card p-6 rounded-2xl border border-border/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-semibold font-title">{title}</h2>
            {description && (
              <p className="text-sm text-foreground/60">{description}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-foreground/40 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {isOpen && <div className="space-y-4">{children}</div>}
    </div>
  );
}

