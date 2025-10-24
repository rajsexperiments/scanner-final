import React from "react";
import { QrCode, List, BarChart3, Settings, LogOut, User, Cake, Activity, BookText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
const navLinkClasses = ({ isActive }: { isActive: boolean }) => isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "";
export function AppSidebar(): JSX.Element {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <QrCode className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">StockLens</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/" className={navLinkClasses}><QrCode /> <span>{t('sidebar.scanner')}</span></NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/cake-status" className={navLinkClasses}><Cake /> <span>{t('sidebar.cakeStatus')}</span></NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/live-operations" className={navLinkClasses}><Activity /> <span>{t('sidebar.liveOps')}</span></NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/documentation" className={navLinkClasses}><BookText /> <span>{t('sidebar.documentation')}</span></NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/log" className={navLinkClasses}><List /> <span>{t('sidebar.inventoryLog')}</span></NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/summary" className={navLinkClasses}><BarChart3 /> <span>{t('sidebar.summary')}</span></NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {currentUser?.role === 'Warehouse Manager' && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/settings" className={navLinkClasses}><Settings /> <span>{t('sidebar.settings')}</span></NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <LanguageSwitcher />
        {currentUser && (
          <div className="p-4 space-y-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-sidebar-foreground">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> {t('sidebar.logout')}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}