"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
  description?: string
}

interface RouteConfig {
  title: string
  description: string
  icon?: React.ReactNode
}

// Configuración de rutas con títulos y descripciones
const routeConfig: Record<string, RouteConfig> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Panel principal del sistema de biblioteca",
  },
  "/dashboard/biblioteca": {
    title: "Registro de documentos",
    description: "Sistema de catalogación y digitalización de documentos",
  },
  "/dashboard/usuarios": {
    title: "Gestión de Usuarios",
    description: "Administra los usuarios del sistema de biblioteca",
  },
  "/dashboard/consultas": {
    title: "Consulta de Documentos",
    description: "Busca y consulta todos los documentos registrados en el sistema",
  },
  "/dashboard/auditoria": {
    title: "Auditoría y Trazabilidad",
    description: "Monitoreo de actividades y estadísticas de usuarios del sistema",
  },
  "/dashboard/reportes": {
    title: "Reportes y Estadísticas",
    description: "Genera reportes y visualiza estadísticas del sistema",
  },
  "/dashboard/configuracion": {
    title: "Configuración del Sistema",
    description: "Administra la configuración general del sistema de biblioteca",
  },
}

export function Breadcrumb() {
  const pathname = usePathname()

  // Generar breadcrumb items basado en la ruta actual
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Agregar Home/Dashboard como primer elemento
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
    })

    // Construir breadcrumbs para cada segmento
    let currentPath = ""
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Solo agregar si no es el dashboard (ya está agregado)
      if (currentPath !== "/dashboard") {
        const config = routeConfig[currentPath]
        if (config) {
          breadcrumbs.push({
            label: config.title,
            href: currentPath,
          })
        } else {
          // Fallback para rutas no configuradas
          breadcrumbs.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: currentPath,
          })
        }
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()
  const currentRoute = routeConfig[pathname]

  return (
    <div className="flex items-start justify-between w-full space-y-0">
     

      {/* Right: Breadcrumb Navigation
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Home className="h-4 w-4" />
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
        {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
        {index === breadcrumbs.length - 1 ? (
          <span className="font-medium text-foreground">{item.label}</span>
        ) : (
          <Link href={item.href} className="hover:text-foreground transition-colors duration-200">
          {item.label}
          </Link>
        )}
        </div>
      ))}
      </nav> */}

       {/* Left: Page Title and Description */}
      <div>
      {currentRoute && (
        <>
        <h1 className="text-lg font-semibold">{currentRoute.title}</h1>
        <p className="text-xs text-muted-foreground">{currentRoute.description}</p>
        </>
      )}
      </div>
    </div>
  )
}
