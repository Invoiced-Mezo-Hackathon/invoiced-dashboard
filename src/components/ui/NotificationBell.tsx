import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAccount } from 'wagmi';

export type AppNotification = {
  id: string;
  title: string;
  message?: string;
  timestamp: number; // ms
  read: boolean;
};

// Helper function to get storage key scoped by wallet address
function getStorageKey(address: string | null | undefined): string {
  if (!address) return '';
  return `notifications_${address.toLowerCase()}`;
}

function loadNotifications(address: string | null | undefined): AppNotification[] {
  if (!address) return [];
  try {
    const storageKey = getStorageKey(address);
    if (!storageKey) return [];
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(address: string | null | undefined, list: AppNotification[]) {
  if (!address) return;
  try {
    const storageKey = getStorageKey(address);
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(list));
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
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const itemsRef = useRef<AppNotification[]>([]);
  const recentKeysRef = useRef<Map<string, number>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { itemsRef.current = items; }, [items]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // Add event listener after a short delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Load on mount and when address changes, sort by timestamp (newest first)
  useEffect(() => {
    if (!address) {
      setItems([]);
      return;
    }
    const loaded = loadNotifications(address);
    // Sort by timestamp descending (newest first)
    const sorted = loaded.sort((a, b) => b.timestamp - a.timestamp);
    setItems(sorted);
  }, [address]);

  // Listen for global notifications
  useEffect(() => {
    if (!address) return;
    const handler = (e: Event) => {
      if (!notificationsEnabled()) return;
      const detail = (e as CustomEvent).detail as Partial<AppNotification> | undefined;
      if (!detail || !detail.title) return;
      // Build a stable dedupe key
      const key = (detail as any).key || `${detail.title}|${detail.message || ''}`;
      const now = Date.now();
      // purge old keys (older than 30s)
      recentKeysRef.current.forEach((ts, k) => { if (now - ts > 30000) recentKeysRef.current.delete(k); });
      if (key && recentKeysRef.current.has(key)) {
        return;
      }
      // Prevent rapid duplicates (same title+message within 5s)
      const last = itemsRef.current[0];
      if (last && last.title === detail.title && (detail.message || '') === (last.message || '') && (now - last.timestamp) < 5000) {
        return;
      }
      if (key) recentKeysRef.current.set(key, now);
      const next: AppNotification = {
        id: String(Date.now()),
        title: detail.title!,
        message: detail.message || '',
        timestamp: now,
        read: false,
      };
      setItems(prev => {
        const updated = [next, ...prev]
          .sort((a, b) => b.timestamp - a.timestamp) // Ensure newest first
          .slice(0, 50);
        saveNotifications(address, updated);
        return updated;
      });
    };
    window.addEventListener('notify', handler as EventListener);
    return () => window.removeEventListener('notify', handler as EventListener);
  }, [address]);

  const unread = useMemo(() => items.filter(i => !i.read).length, [items]);

  const markAllRead = () => {
    if (!address) return;
    setItems(prev => {
      const updated = prev.map(i => ({ ...i, read: true }));
      saveNotifications(address, updated);
      return updated;
    });
  };

  const clearAll = () => {
    if (!address) return;
    setItems([]);
    saveNotifications(address, []);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 touch-manipulation transition-all active:scale-95"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 sm:w-4 sm:h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4.5 px-1.5 rounded-full bg-red-500 text-[10px] leading-[18px] text-white text-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 sm:right-auto sm:left-0 w-[calc(100vw-2rem)] sm:w-80 max-w-[calc(100vw-2rem)] sm:max-w-[90vw] bg-[#2C2C2E]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
            <span className="text-xs sm:text-sm font-navbar text-white/70 font-semibold">Notifications</span>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button onClick={clearAll} className="text-[10px] sm:text-xs text-red-300 hover:text-red-200 active:text-red-100 min-h-[32px] px-2 touch-manipulation">Clear all</button>
              )}
              <button onClick={markAllRead} className="text-[10px] sm:text-xs text-blue-300 hover:text-blue-200 active:text-blue-100 min-h-[32px] px-2 touch-manipulation">Mark all as read</button>
            </div>
          </div>
          <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto overscroll-contain">
            {items.length === 0 ? (
              <div className="p-4 text-xs text-white/60 font-navbar">No notifications yet</div>
            ) : (
              items.map(n => (
                <div key={n.id} className={`px-3 py-2.5 sm:py-2 border-b border-white/5 active:bg-white/5 touch-manipulation ${n.read ? 'opacity-70' : ''}`}>
                  <div className="text-xs sm:text-sm font-navbar text-white font-medium">{n.title}</div>
                  {n.message && <div className="text-[11px] sm:text-xs font-navbar text-white/60 mt-0.5 line-clamp-2">{n.message}</div>}
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
