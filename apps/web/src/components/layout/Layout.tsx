import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toast';
import { WhatsAppFab } from '@/components/shared/WhatsAppFab';
import { Chatbot } from '@/components/chatbot/Chatbot';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      <WhatsAppFab />
      <Chatbot />
    </div>
  );
}
