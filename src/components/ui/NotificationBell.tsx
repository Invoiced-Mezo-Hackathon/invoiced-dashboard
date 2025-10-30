import { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';

export type AppNotification = {
  id: string;
  title: string;
  message?: string;
  timestamp: number; // ms
  read: boolean;
};

const STORAGE_KEY = 'invoiced_notifications';

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(list: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function notificationsEnabled(): boolean {
  try {
    // Respect per-wallet setting if present; otherwise default to true
    // We can't access wallet address here easily, so read all settings and fall back to generic flag
    const keys = Object.keys(localStorage);
    const key = keys.find(k => k.startsWith('invoiced_settings_'));
    if (key) {
      const obj = JSON.parse(localStorage.getItem(key) || '{}');
      return obj.notificationsEnabled !== false;
    }
  } catch {}
  return true;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);

  // Load on mount
  useEffect(() => {
    setItems(loadNotifications());
  }, []);

  // Listen for global notifications
  useEffect(() => {
    const handler = (e: Event) => {
      if (!notificationsEnabled()) return;
      const detail = (e as CustomEvent).detail as Partial<AppNotification> | undefined;
      if (!detail || !detail.title) return;
      const next: AppNotification = {
        id: String(Date.now()),
        title: detail.title!,
        message: detail.message || '',
        timestamp: Date.now(),
        read: false,
      };
      setItems(prev => {
        const updated = [next, ...prev].slice(0, 50);
        saveNotifications(updated);
        return updated;
      });
    };
    window.addEventListener('notify', handler as EventListener);
    return () => window.removeEventListener('notify', handler as EventListener);
  }, []);

  const unread = useMemo(() => items.filter(i => !i.read).length, [items]);

  const markAllRead = () => {
    setItems(prev => {
      const updated = prev.map(i => ({ ...i, read: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  return (
    <div className="relative">
      <button
        className="relative w-9 h-9 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center text-white"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] leading-4 text-white text-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-[#2C2C2E]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-xs font-navbar text-white/70">Notifications</span>
            <button onClick={markAllRead} className="text-[10px] text-blue-300 hover:text-blue-200">Mark all as read</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-4 text-xs text-white/60 font-navbar">No notifications yet</div>
            ) : (
              items.map(n => (
                <div key={n.id} className={`px-3 py-2 border-b border-white/5 ${n.read ? 'opacity-70' : ''}`}>
                  <div className="text-xs font-navbar text-white">{n.title}</div>
                  {n.message && <div className="text-[11px] font-navbar text-white/60 mt-0.5">{n.message}</div>}
                  <div className="text-[10px] font-navbar text-white/40 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
