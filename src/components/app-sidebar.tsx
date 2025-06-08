"use client"

import { BookOpen, Home, Users, Settings, BarChart3, Search, Shield } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Biblioteca",
    url: "/dashboard/biblioteca",
    icon: BookOpen,
  },
  {
    title: "Consultas",
    url: "/dashboard/consultas",
    icon: Search,
  },
  {
    title: "Usuarios",
    url: "/dashboard/usuarios",
    icon: Users,
  },
  {
    title: "Auditoría",
    url: "/dashboard/auditoria",
    icon: Shield,
  },
  {
    title: "Reportes",
    url: "/dashboard/reportes",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    url: "/dashboard/configuracion",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Image src="/cardique.png" alt="" width={32} height={32} />
          <div>
            <h2 className="text-lg font-semibold">CENDOC-CAR</h2>
            <p className="text-sm text-muted-foreground">Sistema de Biblioteca</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
