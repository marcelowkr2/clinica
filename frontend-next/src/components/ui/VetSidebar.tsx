'use client';

import {
  Users,
  Stethoscope,
  FileText,
  Pill,
  Bed,
  TestTube,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  Home,
  UserRound,
  HeartPulse,
  Activity
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarHeaderIcon,
  SidebarHeaderTitle,
  SidebarNav,
  SidebarNavHeader,
  SidebarNavHeaderTitle,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, color: "text-blue-500" },
  { title: "Pacientes", url: "/pacientes", icon: UserRound, color: "text-emerald-500" },
  { title: "Atendimentos", url: "/atendimentos", icon: Stethoscope, color: "text-rose-500" },
  { title: "Internação", url: "/dashboard/internacao", icon: Bed, color: "text-orange-500" },
  { title: "Exames", url: "/exames", icon: TestTube, color: "text-cyan-500" },
  { title: "Receitas", url: "/receitas", icon: FileText, color: "text-indigo-500" },
  { title: "Imunização", url: "/dashboard/vacinas", icon: Pill, color: "text-pink-500" },
  { title: "Procedimentos", url: "/procedimentos", icon: HeartPulse, color: "text-teal-500" },
];

const commercialItems = [
  { title: "Vendas", url: "/vendas", icon: ShoppingCart, color: "text-green-500" },
  { title: "Estoque", url: "/estoque", icon: Package, color: "text-amber-500" },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign, color: "text-yellow-500" },
];

const systemItems = [
  { title: "Usuários", url: "/usuarios", icon: Users, color: "text-slate-500" },
  { title: "Configurações", url: "/configuracoes", icon: Settings, color: "text-gray-500" },
];

function VetSidebarNavItem({ item }: { item: typeof menuItems[0] }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isActive = pathname === item.url;

  return (
    <Link
      href={item.url}
      className={cn(
        "group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        state === "collapsed" && "justify-center px-2"
      )}
    >
      <item.icon className={cn(
        "h-5 w-5 shrink-0 transition-colors",
        isActive ? "text-primary-foreground" : item.color
      )} />
      <span
        data-state={state}
        className={cn(
          "transition-[opacity,transform] duration-300 ease-in-out",
          state === "collapsed" && "scale-0 opacity-0 hidden"
        )}
      >
        {item.title}
      </span>
    </Link>
  );
}

export function VetSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar className="bg-card border-r-border/50">
      {/* Cabeçalho */}
      <SidebarHeader className="h-16 border-b border-border/50 mb-2">
        <SidebarHeaderIcon>
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
        </SidebarHeaderIcon>
        <SidebarHeaderTitle>
          <div className="ml-1">
            <h2 className="text-lg font-extrabold tracking-tight text-foreground">MediHub</h2>
            <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60">Gestão Clínica</p>
          </div>
        </SidebarHeaderTitle>
      </SidebarHeader>

      {/* Conteúdo do Menu */}
      <SidebarContent className="px-2">
        {/* Grupo Atendimento */}
        <div className="py-2">
          <SidebarNavHeader className="mb-1 px-2">
            <SidebarNavHeaderTitle className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/40">
              Principal
            </SidebarNavHeaderTitle>
          </SidebarNavHeader>
          <SidebarNav className="gap-0.5">
            {menuItems.map((item) => (
              <VetSidebarNavItem key={item.title} item={item} />
            ))}
          </SidebarNav>
        </div>

        {/* Grupo Comercial */}
        <div className="py-2 border-t border-border/50">
          <SidebarNavHeader className="mb-1 px-2">
            <SidebarNavHeaderTitle className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/40">
              Comercial
            </SidebarNavHeaderTitle>
          </SidebarNavHeader>
          <SidebarNav className="gap-0.5">
            {commercialItems.map((item) => (
              <VetSidebarNavItem key={item.title} item={item} />
            ))}
          </SidebarNav>
        </div>

        {/* Grupo Sistema */}
        <div className="py-2 border-t border-border/50 pb-6">
          <SidebarNavHeader className="mb-1 px-2">
            <SidebarNavHeaderTitle className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/40">
              Sistema
            </SidebarNavHeaderTitle>
          </SidebarNavHeader>
          <SidebarNav className="gap-0.5">
            {systemItems.map((item) => (
              <VetSidebarNavItem key={item.title} item={item} />
            ))}
          </SidebarNav>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
