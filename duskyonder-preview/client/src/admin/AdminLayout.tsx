import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard, Image, Megaphone, Grid3X3, ShoppingBag, Video,
  Layers, Shirt, PanelBottom, Navigation, LogOut, PanelLeft, Loader2,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "板块管理", path: "/admin" },
  { icon: Image, label: "Hero Banner", path: "/admin/hero" },
  { icon: Megaphone, label: "促销栏", path: "/admin/promo" },
  { icon: Grid3X3, label: "分类板块", path: "/admin/categories" },
  { icon: ShoppingBag, label: "产品板块", path: "/admin/products" },
  { icon: Video, label: "视频板块", path: "/admin/videos" },
  { icon: Layers, label: "系列板块", path: "/admin/series" },
  { icon: Shirt, label: "面料板块", path: "/admin/fabric" },
  { icon: PanelBottom, label: "页脚", path: "/admin/footer" },
  { icon: Navigation, label: "导航栏", path: "/admin/navigation" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">管理后台</h1>
          <p className="text-muted-foreground text-sm mb-6">请登录以继续</p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            登录
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">无权限访问</h1>
          <p className="text-muted-foreground text-sm mb-6">此页面仅管理员可访问</p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!collapsed}>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar collapsible="icon" className="border-r border-border/50 bg-background">
          <SidebarHeader className="h-14 flex items-center justify-between px-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <button
                onClick={() => setCollapsed(v => !v)}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors shrink-0"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="font-semibold text-sm truncate group-data-[collapsible=icon]:hidden">
                Dusk Yonder Admin
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 px-2 py-1">
            <SidebarMenu>
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className="h-10 font-normal transition-all"
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-accent/50 transition-colors w-full text-left focus:outline-none">
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() ?? "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-xs font-medium truncate">{user?.name ?? "Admin"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => { logout(); setLocation("/"); }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur md:hidden">
            <SidebarTrigger className="h-8 w-8" />
            <span className="text-sm font-medium">
              {menuItems.find(m => m.path === location)?.label ?? "管理后台"}
            </span>
          </div>
          <main className="p-5">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
