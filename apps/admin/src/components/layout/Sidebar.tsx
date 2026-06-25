import { NavLink } from 'react-router-dom';
import { BarChart2, BookOpen, LayoutDashboard, LogOut, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/',      icon: LayoutDashboard },
  { label: 'Cursos',        path: '/cursos', icon: BookOpen },
  { label: 'Ventas',        path: '/ventas', icon: BarChart2 },
  { label: 'Bot WhatsApp',  path: '/bot',    icon: MessageCircle },
] as const;

function NavItem({
  label,
  path,
  icon: Icon,
}: {
  label: string;
  path: string;
  icon: React.ElementType;
}) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
          'transition-all duration-200',
          isActive
            ? 'bg-cee-red-dark text-white'
            : 'text-white/80 hover:bg-white hover:text-cee-red',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside
      className={cn(
        'flex h-screen w-60 shrink-0 flex-col bg-cee-red font-sans',
        'shadow-[2px_0_12px_rgba(0,0,0,0.20)]',
      )}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
          <span className="text-[11px] font-black leading-none tracking-tight text-cee-red">
            CEE
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-none text-white">CEE-FIIS</p>
          <p className="mt-0.5 truncate text-[10px] leading-none text-white/55">
            Panel Administrativo
          </p>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/15" />

      {/* ── Navegación principal ── */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* ── Separador + Salir ── */}
      <div className="px-3 pb-6">
        <div className="mb-3 h-px bg-white/15" />
        <button
          type="button"
          onClick={() => void authService.logout()}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
            'text-white/80 transition-all duration-200',
            'hover:bg-white hover:text-cee-red',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Salir
        </button>
      </div>
    </aside>
  );
}
