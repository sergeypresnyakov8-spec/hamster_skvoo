import React from 'react';
import { Compass, Rocket, Shield, ShoppingBag, Users } from 'lucide-react';
import { TabId } from '../game/types';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  unclaimedDailyCount: number;
}

const NAV_ITEMS: Array<{ id: TabId; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'fleet', label: 'Флот', Icon: Shield },
  { id: 'crew', label: 'Экипаж', Icon: Users },
  { id: 'map', label: 'Карта', Icon: Compass },
  { id: 'bridge', label: 'Мостик', Icon: Rocket },
  { id: 'shop', label: 'Маркет', Icon: ShoppingBag },
];

export const BottomNav: React.FC<BottomNavProps> = React.memo(({ activeTab, onSelectTab, unclaimedDailyCount }) => {
  return (
    <nav
      aria-label="Основная навигация"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#0B0D14]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-5 h-16">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
                active ? 'text-[#E5A93C]' : 'text-[#9AA3B5] hover:text-[#F4F1EA]'
              }`}
            >
              {active && (
                <span className="absolute top-0 inset-x-4 h-0.5 rounded-full bg-[#E5A93C]" aria-hidden="true" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${active ? 'scale-110' : ''}`} />
                {id === 'fleet' && unclaimedDailyCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1 rounded bg-rose-500 text-white text-[9px] font-num font-bold leading-tight">
                    {unclaimedDailyCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
