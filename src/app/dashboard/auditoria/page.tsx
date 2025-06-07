"use client"

import { useState, useEffect } from "react"
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
  created_at: string
  ip: string
  navegador: string
}

interface UserStats {
  usuario: string
  documentoscreados: number
  documentoseditados: number
  consultasrealizadas: number
  tiempoSesion: string
  ultimaactividad: string
}

interface DailyStats {
  fecha: string
  usuario: string
  libros: number
  librosAnillados: number
  azs: number
  total: number
}

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<string>("todas")
  const [filterModule, setFilterModule] = useState<string>("todos")
  const [filterUser, setFilterUser] = useState<string>("todos")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar logs de auditoría
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterAction !== "todas") params.append("accion", filterAction)
    if (filterModule !== "todos") params.append("modulo", filterModule)
    if (filterUser !== "todos") params.append("usuario", filterUser)
    if (searchTerm) params.append("search", searchTerm)
    
    const token = localStorage.getItem("token") || ""
    fetch(`http://localhost:8000/api/audit-logs?${params.toString()}`, {
      headers: {
      Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setAuditLogs(data))
      .finally(() => setLoading(false))
    }, [filterAction, filterModule, filterUser, searchTerm])

    // Cargar estadísticas de usuario
    useEffect(() => {
    const token = localStorage.getItem("token") || ""
    fetch("http://localhost:8000/api/audit-logs/user-stats", {
      headers: {
      Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUserStats(data))
    }, [])

    // Cargar estadísticas diarias
    useEffect(() => {
    const token = localStorage.getItem("token") || ""
    fetch("http://localhost:8000/api/audit-logs/daily-stats", {
      headers: {
      Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setDailyStats(data))
    }, [])

  // Filtrar logs de auditoría (ya viene filtrado del backend)
  const filteredLogs = auditLogs

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log)
    setIsViewDialogOpen(true)
  }

  // Exportar log
  const handleExport = () => {
    const params = new URLSearchParams()
    if (filterAction !== "todas") params.append("accion", filterAction)
    if (filterModule !== "todos") params.append("modulo", filterModule)
    if (filterUser !== "todos") params.append("usuario", filterUser)
    if (searchTerm) params.append("search", searchTerm)
    const token = localStorage.getItem("token") || ""
    fetch(`http://localhost:8000/api/audit-logs/export?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "audit-log.xlsx"
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      })
  }

  const getActionBadge = (accion: string) => {
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

  // Obtener usuarios únicos para el filtro
  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.usuario)))

  // Calcular estadísticas generales
  const activitiesToday = auditLogs.filter(log => {
  const today = new Date().toISOString().split('T')[0]
  return log.created_at && log.created_at.includes(today)
}).length

const docsCreatedToday = auditLogs.filter(log => {
  const today = new Date().toISOString().split('T')[0]
  return log.accion === "crear" && log.modulo === "documentos" && 
         log.created_at && log.created_at.includes(today)
}).length

// Formatear fecha y hora
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  
  // Formatear fecha como DD/MM/YYYY
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  
  // Formatear hora como HH:MM:SS
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  
  return {
    date: formattedDate,
    time: formattedTime
  };
};

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
            <div className="text-2xl font-bold">{activitiesToday}</div>
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
            <div className="text-2xl font-bold">{docsCreatedToday}</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.length > 0 
                ? userStats.reduce((acc, stat) => {
                    const [hours, minutes] = stat.tiempoSesion.split('h ').map(part => parseInt(part));
                    return acc + (hours * 60 + minutes);
                  }, 0) / userStats.length + 'm'
                : '0m'}
            </div>
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
                <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
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
                    {uniqueUsers.map(usuario => (
                      <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tabla de auditoría */}
              {/* Tabla de auditoría */}
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Fecha</TableHead>
        <TableHead>Hora</TableHead>
        <TableHead>Usuario</TableHead>
        <TableHead>Acción</TableHead>
        <TableHead>Módulo</TableHead>
        <TableHead>Descripción</TableHead>
        <TableHead className="text-right">Acciones</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-4">
            Cargando registros...
          </TableCell>
        </TableRow>
      ) : filteredLogs.length > 0 ? (
        filteredLogs.map((log) => {
          const { date, time } = formatDateTime(log.created_at);
          return (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-sm">{date}</TableCell>
              <TableCell className="font-mono text-sm">{time}</TableCell>
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
          )
        })
      ) : (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-4">
            No se encontraron registros
          </TableCell>
        </TableRow>
      )}
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
            {userStats.length > 0 ? (
              userStats.map((stat, index) => {
                // Formatear la fecha de última actividad
                const ultimaActividad = stat.ultimaactividad ? 
                  new Date(stat.ultimaactividad).toLocaleString() : 
                  'Sin registro';
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{stat.usuario}</TableCell>
                    <TableCell>
                      <Badge variant="default">{stat.documentoscreados}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stat.documentoseditados}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{stat.consultasrealizadas}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{stat.tiempoSesion}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {ultimaActividad}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No hay estadísticas disponibles
                </TableCell>
              </TableRow>
            )}
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
                    {dailyStats.length > 0 ? (
                      dailyStats.map((stat, index) => (
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No hay datos de productividad disponibles
                        </TableCell>
                      </TableRow>
                    )}
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
                    <div className="text-2xl font-bold">
                      {dailyStats.length > 0 
                        ? dailyStats.reduce((max, stat) => stat.total > max.total ? stat : max, dailyStats[0]).usuario
                        : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dailyStats.length > 0 
                        ? `${dailyStats.reduce((max, stat) => stat.total > max.total ? stat : max, dailyStats[0]).total} documentos hoy`
                        : 'No hay datos'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tipo Más Digitado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dailyStats.length > 0 
                        ? ['libros', 'librosAnillados', 'azs'].reduce((maxType, type) => 
                            dailyStats.reduce((sum, stat) => sum + (stat as any)[type], 0) > 
                            dailyStats.reduce((sum, stat) => sum + (stat as any)[maxType], 0) 
                              ? type : maxType, 'libros')
                        : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dailyStats.length > 0 
                        ? `${dailyStats.reduce((sum, stat) => sum + stat.libros + stat.librosAnillados + stat.azs, 0)} documentos hoy`
                        : 'No hay datos'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Promedio Diario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dailyStats.length > 0 
                        ? (dailyStats.reduce((sum, stat) => sum + stat.total, 0) / dailyStats.length).toFixed(1)
                        : '0'}
                    </div>
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
                  <p className="text-sm bg-muted p-2 rounded font-mono">{selectedLog.created_at}</p>
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