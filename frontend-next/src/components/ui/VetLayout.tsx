'use client';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VetSidebar } from "./VetSidebar";
import { Bell, User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/theme";
import { useAuth } from "@/hooks/auth";
import { GlobalSearch } from "./GlobalSearch";

interface VetLayoutProps {
  children: React.ReactNode;
}

export function VetLayout({ children }: VetLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <VetSidebar />

        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Header */}
          <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex h-full items-center px-4 gap-2 md:px-6 md:gap-4">
              {/* Botão para recolher/expandir sidebar */}
              <SidebarTrigger className="hover:bg-secondary transition-colors rounded-lg" />

              {/* Busca Global */}
              <div className="flex-1 max-w-sm md:max-w-md">
                <GlobalSearch />
              </div>

              {/* Ações do Header */}
              <div className="flex items-center gap-1.5 md:gap-3">
                {/* Notificações */}
                <Button variant="ghost" size="icon" className="relative hover:bg-secondary rounded-lg transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-background"></span>
                </Button>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-border/50 mx-1"></div>

                {/* Toggle Tema */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-secondary rounded-lg transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-700" />
                  )}
                </Button>

                {/* Perfil do Usuário */}
                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Usuário'}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                      Veterinário
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <User className="h-5 w-5" />
                  </div>
                </div>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                  title="Sair da aplicação"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Conteúdo Principal */}
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
