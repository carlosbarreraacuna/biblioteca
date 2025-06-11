"use client"

import {
  BookOpen,
  Home,
  Users,
  Settings,
  BarChart3,
  Search,
  Shield,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/app/context/AuthContext"

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

const fullMenu = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["Admin", "Digitador"],
  },
  {
    title: "Biblioteca",
    url: "/dashboard/biblioteca",
    icon: BookOpen,
    roles: ["Admin", "Digitador"],
  },
  {
    title: "Consultas",
    url: "/dashboard/consultas",
    icon: Search,
    roles: ["Admin", "Digitador"],
  },
  {
    title: "Usuarios",
    url: "/dashboard/usuarios",
    icon: Users,
    roles: ["Admin"],
  },
  {
    title: "Auditoría",
    url: "/dashboard/auditoria",
    icon: Shield,
    roles: ["Admin"],
  },
  {
    title: "Reportes",
    url: "/dashboard/reportes",
    icon: BarChart3,
    roles: ["Admin"],
  },
  {
    title: "Configuración",
    url: "/dashboard/configuracion",
    icon: Settings,
    roles: ["Admin"],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, isHydrated } = useAuth()

  // 🟡 Mostrar nada mientras carga o no hay sesión
  if (!isHydrated) return null
  if (!user?.role) return null

  // 🟢 Filtrar menús según el rol actual
  const allowedMenu = fullMenu.filter((item) =>
    item.roles.includes(user.role)
  )

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
              {allowedMenu.map((item) => (
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
