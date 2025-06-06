"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Download, Activity, Users, FileText, Clock } from "lucide-react"

interface AuditLog {
  id: string
  usuario: string
  accion: "crear" | "editar" | "eliminar" | "consultar" | "login" | "logout"
  modulo: "documentos" | "usuarios" | "configuracion" | "reportes" | "sistema"
  descripcion: string
  detalles: string
  fechaHora: string
  ip: string
  navegador: string
}

interface UserStats {
  usuario: string
  documentosCreados: number
  documentosEditados: number
  consultasRealizadas: number
  tiempoSesion: string
  ultimaActividad: string
}

interface DailyStats {
  fecha: string
  usuario: string
  libros: number
  librosAnillados: number
  azs: number
  total: number
}

// Datos de ejemplo para auditoría
const auditLogs: AuditLog[] = [
  {
    id: "1",
    usuario: "Juan Pérez",
    accion: "crear",
    modulo: "documentos",
    descripcion: "Creó documento MI0001",
    detalles: "Documento: Historia de la Institución Educativa - Dr. Carlos Mendoza",
    fechaHora: "2024-12-06 09:15:23",
    ip: "192.168.1.100",
    navegador: "Chrome 120.0",
  },
  {
    id: "2",
    usuario: "María García",
    accion: "editar",
    modulo: "usuarios",
    descripcion: "Editó usuario Carlos López",
    detalles: "Cambió rol de usuario a bibliotecario",
    fechaHora: "2024-12-06 08:45:12",
    ip: "192.168.1.101",
    navegador: "Firefox 121.0",
  },
  {
    id: "3",
    usuario: "Juan Pérez",
    accion: "crear",
    modulo: "documentos",
    descripcion: "Creó documento CG0025",
    detalles: "Documento: Manual de Procedimientos - María García López",
    fechaHora: "2024-12-06 10:30:45",
    ip: "192.168.1.100",
    navegador: "Chrome 120.0",
  },
  {
    id: "4",
    usuario: "Ana Martínez",
    accion: "consultar",
    modulo: "documentos",
    descripcion: "Consultó catálogo de documentos",
    detalles: "Filtró por denominación: Jurídico",
    fechaHora: "2024-12-06 11:20:18",
    ip: "192.168.1.102",
    navegador: "Safari 17.0",
  },
  {
    id: "5",
    usuario: "Carlos López",
    accion: "crear",
    modulo: "documentos",
    descripcion: "Creó documento J0012",
    detalles: "Documento: Código Civil Comentado - Alejandro Pérez Ruiz",
    fechaHora: "2024-12-06 14:15:30",
    ip: "192.168.1.103",
    navegador: "Edge 120.0",
  },
  {
    id: "6",
    usuario: "María García",
    accion: "login",
    modulo: "sistema",
    descripcion: "Inició sesión en el sistema",
    detalles: "Login exitoso",
    fechaHora: "2024-12-06 08:00:00",
    ip: "192.168.1.101",
    navegador: "Firefox 121.0",
  },
  {
    id: "7",
    usuario: "Juan Pérez",
    accion: "editar",
    modulo: "documentos",
    descripcion: "Editó documento MI0001",
    detalles: "Actualizó información del autor",
    fechaHora: "2024-12-06 15:45:22",
    ip: "192.168.1.100",
    navegador: "Chrome 120.0",
  },
]

// Estadísticas de usuarios
const userStats: UserStats[] = [
  {
    usuario: "Juan Pérez",
    documentosCreados: 15,
    documentosEditados: 8,
    consultasRealizadas: 45,
    tiempoSesion: "6h 30m",
    ultimaActividad: "2024-12-06 15:45:22",
  },
  {
    usuario: "María García",
    documentosCreados: 12,
    documentosEditados: 15,
    consultasRealizadas: 32,
    tiempoSesion: "5h 15m",
    ultimaActividad: "2024-12-06 14:20:10",
  },
  {
    usuario: "Carlos López",
    documentosCreados: 8,
    documentosEditados: 5,
    consultasRealizadas: 28,
    tiempoSesion: "4h 45m",
    ultimaActividad: "2024-12-06 14:15:30",
  },
  {
    usuario: "Ana Martínez",
    documentosCreados: 6,
    documentosEditados: 3,
    consultasRealizadas: 67,
    tiempoSesion: "3h 20m",
    ultimaActividad: "2024-12-06 11:20:18",
  },
]

// Estadísticas diarias por usuario
const dailyStats: DailyStats[] = [
  {
    fecha: "2024-12-06",
    usuario: "Juan Pérez",
    libros: 3,
    librosAnillados: 2,
    azs: 1,
    total: 6,
  },
  {
    fecha: "2024-12-06",
    usuario: "María García",
    libros: 2,
    librosAnillados: 1,
    azs: 0,
    total: 3,
  },
  {
    fecha: "2024-12-06",
    usuario: "Carlos López",
    libros: 1,
    librosAnillados: 0,
    azs: 2,
    total: 3,
  },
  {
    fecha: "2024-12-05",
    usuario: "Juan Pérez",
    libros: 4,
    librosAnillados: 1,
    azs: 0,
    total: 5,
  },
  {
    fecha: "2024-12-05",
    usuario: "Ana Martínez",
    libros: 0,
    librosAnillados: 3,
    azs: 1,
    total: 4,
  },
]

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<string>("todas")
  const [filterModule, setFilterModule] = useState<string>("todos")
  const [filterUser, setFilterUser] = useState<string>("todos")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filtrar logs de auditoría
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalles.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = filterAction === "todas" || log.accion === filterAction
    const matchesModule = filterModule === "todos" || log.modulo === filterModule
    const matchesUser = filterUser === "todos" || log.usuario === filterUser

    return matchesSearch && matchesAction && matchesModule && matchesUser
  })

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log)
    setIsViewDialogOpen(true)
  }

  const getActionBadge = (accion: string) => {
    const variants = {
      crear: "default",
      editar: "secondary",
      eliminar: "destructive",
      consultar: "outline",
      login: "default",
      logout: "secondary",
    } as const

    const colors = {
      crear: "bg-green-100 text-green-800",
      editar: "bg-blue-100 text-blue-800",
      eliminar: "bg-red-100 text-red-800",
      consultar: "bg-gray-100 text-gray-800",
      login: "bg-purple-100 text-purple-800",
      logout: "bg-orange-100 text-orange-800",
    }

    return (
      <Badge className={colors[accion as keyof typeof colors]}>
        {accion.charAt(0).toUpperCase() + accion.slice(1)}
      </Badge>
    )
  }

  const getModuleBadge = (modulo: string) => {
    const colors = {
      documentos: "bg-blue-100 text-blue-800",
      usuarios: "bg-green-100 text-green-800",
      configuracion: "bg-purple-100 text-purple-800",
      reportes: "bg-orange-100 text-orange-800",
      sistema: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge variant="outline" className={colors[modulo as keyof typeof colors]}>
        {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auditoría y Trazabilidad</h1>
        <p className="text-muted-foreground">Monitoreo de actividades y estadísticas de usuarios del sistema</p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades Hoy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter((log) => log.fechaHora.includes("2024-12-06")).length}
            </div>
            <p className="text-xs text-muted-foreground">Acciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.length}</div>
            <p className="text-xs text-muted-foreground">En las últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Creados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter((log) => log.accion === "crear" && log.modulo === "documentos").length}
            </div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4h 52m</div>
            <p className="text-xs text-muted-foreground">Sesión por usuario</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="auditoria" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auditoria">Log de Auditoría</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas de Usuarios</TabsTrigger>
          <TabsTrigger value="productividad">Productividad Diaria</TabsTrigger>
        </TabsList>

        {/* Tab de Auditoría */}
        <TabsContent value="auditoria">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Registro de Actividades</CardTitle>
                  <CardDescription>Historial completo de acciones realizadas en el sistema</CardDescription>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Log
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por usuario, descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las acciones</SelectItem>
                    <SelectItem value="crear">Crear</SelectItem>
                    <SelectItem value="editar">Editar</SelectItem>
                    <SelectItem value="eliminar">Eliminar</SelectItem>
                    <SelectItem value="consultar">Consultar</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterModule} onValueChange={setFilterModule}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los módulos</SelectItem>
                    <SelectItem value="documentos">Documentos</SelectItem>
                    <SelectItem value="usuarios">Usuarios</SelectItem>
                    <SelectItem value="configuracion">Configuración</SelectItem>
                    <SelectItem value="reportes">Reportes</SelectItem>
                    <SelectItem value="sistema">Sistema</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los usuarios</SelectItem>
                    <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
                    <SelectItem value="María García">María García</SelectItem>
                    <SelectItem value="Carlos López">Carlos López</SelectItem>
                    <SelectItem value="Ana Martínez">Ana Martínez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabla de auditoría */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha/Hora</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.fechaHora}</TableCell>
                        <TableCell className="font-medium">{log.usuario}</TableCell>
                        <TableCell>{getActionBadge(log.accion)}</TableCell>
                        <TableCell>{getModuleBadge(log.modulo)}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.descripcion}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLog(log)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Estadísticas de Usuarios */}
        <TabsContent value="estadisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas por Usuario</CardTitle>
              <CardDescription>Resumen de actividad y productividad de cada usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Docs. Creados</TableHead>
                      <TableHead>Docs. Editados</TableHead>
                      <TableHead>Consultas</TableHead>
                      <TableHead>Tiempo Sesión</TableHead>
                      <TableHead>Última Actividad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.usuario}</TableCell>
                        <TableCell>
                          <Badge variant="default">{stat.documentosCreados}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{stat.documentosEditados}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{stat.consultasRealizadas}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{stat.tiempoSesion}</TableCell>
                        <TableCell className="font-mono text-sm">{stat.ultimaActividad}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Productividad Diaria */}
        <TabsContent value="productividad">
          <Card>
            <CardHeader>
              <CardTitle>Productividad Diaria por Tipo de Documento</CardTitle>
              <CardDescription>Cantidad de documentos digitados por usuario y por día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Libros</TableHead>
                      <TableHead>Libros Anillados</TableHead>
                      <TableHead>AZS</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{stat.fecha}</TableCell>
                        <TableCell className="font-medium">{stat.usuario}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            {stat.libros}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {stat.librosAnillados}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-purple-100 text-purple-800">
                            {stat.azs}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-gray-800 text-white">
                            {stat.total}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Resumen de productividad */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Usuario Más Productivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Juan Pérez</div>
                    <p className="text-xs text-muted-foreground">11 documentos hoy</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tipo Más Digitado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Libros</div>
                    <p className="text-xs text-muted-foreground">10 documentos hoy</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Promedio Diario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.2</div>
                    <p className="text-xs text-muted-foreground">docs por usuario</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles del log */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Actividad</DialogTitle>
            <DialogDescription>Información completa del registro de auditoría</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Usuario</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedLog.usuario}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Fecha y Hora</Label>
                  <p className="text-sm bg-muted p-2 rounded font-mono">{selectedLog.fechaHora}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Acción</Label>
                  <div className="flex items-center">{getActionBadge(selectedLog.accion)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Módulo</Label>
                  <div className="flex items-center">{getModuleBadge(selectedLog.modulo)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Descripción</Label>
                <p className="text-sm bg-muted p-2 rounded">{selectedLog.descripcion}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Detalles</Label>
                <p className="text-sm bg-muted p-2 rounded">{selectedLog.detalles}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Dirección IP</Label>
                  <p className="text-sm bg-muted p-2 rounded font-mono">{selectedLog.ip}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Navegador</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedLog.navegador}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
