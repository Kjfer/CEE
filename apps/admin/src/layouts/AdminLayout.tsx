import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/authStore';

export function AdminLayout() {
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
          <span className="text-sm font-medium text-muted-foreground">
            Panel administrativo
          </span>
          {user && (
            <span className="text-sm font-medium text-foreground">{user.name}</span>
          )}
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
