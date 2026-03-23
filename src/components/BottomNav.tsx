import { NavLink } from 'react-router-dom';
import { Home, Activity, Apple, MapPin, Stethoscope, Map } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'ホーム' },
    { to: '/health', icon: Activity, label: '記録' },
    { to: '/food', icon: Apple, label: 'ごはん' },
    { to: '/hospital', icon: MapPin, label: '病院' },
    { to: '/symptom', icon: Stethoscope, label: '相談' },
    { to: '/walk', icon: Map, label: '散歩' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] glass-panel rounded-full z-50 shadow-2xl">
      <div className="px-4 h-16 flex items-center justify-between">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300',
                isActive ? 'text-gold' : 'text-text-muted hover:text-text-main'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 1.5 : 1}
                  className={cn('transition-transform duration-300', isActive && 'scale-110 -translate-y-0.5')}
                />
                <span className={cn("text-[9px] tracking-widest transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
