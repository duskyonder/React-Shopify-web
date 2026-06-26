import React, { useState } from "react";
import { useLocation } from "wouter";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
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
  Layers, Shirt, PanelBottom, Navigation, LogOut, PanelLeft, Loader2, Mail, ShoppingCart,
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
  { icon: Mail, label: "订阅弹框", path: "/admin/newsletter" },
  { icon: ShoppingCart, label: "购物车设置", path: "/admin/cart" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "duskyonder2024";

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { isSaving } = useThemeConfig();
  const [authed, setAuthed] = useState(() => {
    return sessionStorage.getItem("admin_authed") === "1";
  });
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <div className="w-full max-w-sm p-8 rounded-xl border border-border bg-card shadow-sm">
          <h1 className="text-xl font-semibold mb-1 text-center">管理后台</h1>
          <p className="text-muted-foreground text-sm mb-6 text-center">请输入管理员密码</p>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (pwd === ADMIN_PASSWORD) {
                sessionStorage.setItem("admin_authed", "1");
                setAuthed(true);
                setError("");
              } else {
                setError("密码错误，请重试");
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="管理员密码"
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              进入
            </button>
          </form>
        </div>
      </div>
    );
  }

  const user = { name: "Admin", email: "influencer@duskyonder.com" };

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
                  onClick={() => { sessionStorage.removeItem("admin_authed"); setLocation("/"); }}
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
          <div className="sticky top-0 z-10 flex h-12 items-center justify-between gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger className="h-8 w-8" />
              <span className="text-sm font-medium">
                {menuItems.find(m => m.path === location)?.label ?? "管理后台"}
              </span>
            </div>
            <div className="hidden md:flex" />
            {isSaving && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>保存中...</span>
              </div>
            )}
          </div>
          <main className="p-5">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
