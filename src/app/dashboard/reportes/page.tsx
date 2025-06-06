"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, FileText, Users, BookOpen, TrendingUp, BarChart3, PieChart } from "lucide-react"

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
        <p className="text-muted-foreground">Genera reportes y visualiza estadísticas del sistema</p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Totales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+8% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Mensuales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,678</div>
            <p className="text-xs text-muted-foreground">+23% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Nuevos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Generador de reportes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reportes de Documentos
            </CardTitle>
            <CardDescription>Genera reportes detallados sobre la colección de documentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Reporte</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los documentos</SelectItem>
                  <SelectItem value="por-denominacion">Por denominación</SelectItem>
                  <SelectItem value="por-fecha">Por fecha de registro</SelectItem>
                  <SelectItem value="por-autor">Por autor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-actual">Mes actual</SelectItem>
                  <SelectItem value="trimestre">Último trimestre</SelectItem>
                  <SelectItem value="año">Año actual</SelectItem>
                  <SelectItem value="personalizado">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Reportes de Usuarios
            </CardTitle>
            <CardDescription>Estadísticas y reportes sobre usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Reporte</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actividad">Actividad de usuarios</SelectItem>
                  <SelectItem value="por-rol">Usuarios por rol</SelectItem>
                  <SelectItem value="registros">Nuevos registros</SelectItem>
                  <SelectItem value="accesos">Historial de accesos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Formato</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reportes rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Rápidos</CardTitle>
          <CardDescription>Accede a reportes predefinidos más utilizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <FileText className="h-6 w-6 mb-2" />
              <span>Inventario Completo</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Users className="h-6 w-6 mb-2" />
              <span>Lista de Usuarios</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Calendar className="h-6 w-6 mb-2" />
              <span>Actividad Mensual</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Estadísticas Generales</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <BookOpen className="h-6 w-6 mb-2" />
              <span>Documentos por Tipo</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Tendencias de Uso</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
