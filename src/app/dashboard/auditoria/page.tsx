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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Search, Eye, Download, Activity, Users, FileText, Clock, Calendar as CalendarIcon, RefreshCw } from "lucide-react"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"

// Interfaces
interface AuditLog {
  id: number
  user_id: number
  usuario: string
  accion: "crear" | "editar" | "eliminar" | "consultar" | "login" | "logout"
  modulo: "documentos" | "usuarios" | "configuracion" | "reportes" | "sistema"
  descripcion: string
  detalles: string
  created_at: string
  ip_address: string | null
  navegador: string | null
}

interface UserStats {
  usuario: string
  documentoscreados: number
  documentoseditados: number
  consultasrealizadas: number
  tiempoSesion: string
  ultimaactividad: string
}

interface DailyStat {
  fecha: string
  user_id: string
  libros: number
  libros_anillados: number
  azs: number
  total: number
}

interface PeriodTotals {
  libros: number
  libros_anillados: number
  azs: number
  total: number
}

// Función para formatear fechas en hora de Colombia (UTC-5)
const formatColombiaTime = (isoString: string) => {
  if (!isoString) return 'Sin registro';

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(isoString)) {
    const isoWithZ = isoString.replace(' ', 'T') + 'Z';
    return new Date(isoWithZ).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Bogota'
    });
  }

  return new Date(isoString).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Bogota'
  });
};

const formatDateTime = (isoString: string) => {
  if (!isoString) return { date: 'N/A', time: 'N/A' };
  
  const date = new Date(isoString);
  
  return {
    date: date.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'America/Bogota'
    }),
    time: date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Bogota'
    })
  };
}

// Componente principal
export default function AuditoriaPage() {
  // Estados
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<string>("todas")
  const [filterModule, setFilterModule] = useState<string>("todos")
  const [filterUser, setFilterUser] = useState<string>("todos")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [periodTotals, setPeriodTotals] = useState<PeriodTotals>({
    libros: 0,
    libros_anillados: 0,
    azs: 0,
    total: 0
  })
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 7))
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date())
  const [selectedUser, setSelectedUser] = useState<string>("todos")

  // Nuevos estados para paginación
  const [auditLogsPage, setAuditLogsPage] = useState(1)
  const [auditLogsPerPage, setAuditLogsPerPage] = useState(10)
  const [auditLogsTotalPages, setAuditLogsTotalPages] = useState(1)
  const [auditLogsTotalItems, setAuditLogsTotalItems] = useState(0)

  const [userStatsPage, setUserStatsPage] = useState(1)
  const [userStatsPerPage, setUserStatsPerPage] = useState(5)
  const [userStatsTotalPages, setUserStatsTotalPages] = useState(1)
  const [userStatsTotalItems, setUserStatsTotalItems] = useState(0)

  const [dailyStatsPage, setDailyStatsPage] = useState(1)
  const [dailyStatsPerPage, setDailyStatsPerPage] = useState(10)
  const [dailyStatsTotalPages, setDailyStatsTotalPages] = useState(1)
  const [dailyStatsTotalItems, setDailyStatsTotalItems] = useState(0)

  // Obtener usuarios únicos para los filtros
  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.usuario)))
  const uniqueDailyUsers = Array.from(new Set(dailyStats.map(stat => stat.user_id)))

  // Funciones para cargar datos
  const fetchAuditLogs = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterAction !== "todas") params.append("accion", filterAction)
    if (filterModule !== "todos") params.append("modulo", filterModule)
    if (filterUser !== "todos") params.append("usuario", filterUser)
    if (searchTerm) params.append("search", searchTerm)
    params.append("page", auditLogsPage.toString())
    params.append("per_page", auditLogsPerPage.toString())
    
    const token = localStorage.getItem("token") || ""
    
    try {
      const response = await fetch(`http://localhost:8000/api/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      
      setAuditLogs(Array.isArray(data.data) ? data.data : [])
      setAuditLogsTotalPages(data.last_page || 1)
      setAuditLogsTotalItems(data.total || 0)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    const token = localStorage.getItem("token") || ""
    const params = new URLSearchParams()
    params.append("page", userStatsPage.toString())
    params.append("per_page", userStatsPerPage.toString())
    
    try {
      const response = await fetch(`http://localhost:8000/api/audit-logs/user-stats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setUserStats(Array.isArray(data.data) ? data.data : [])
      setUserStatsTotalPages(data.last_page || 1)
      setUserStatsTotalItems(data.total || 0)
    } catch (error) {
      console.error("Error fetching user stats:", error)
      setUserStats([])
    }
  }

  const fetchDailyStats = async () => {
    setLoading(true)
    const token = localStorage.getItem("token") || ""
    const params = new URLSearchParams()
    if (dateFrom) params.append('fecha_desde', format(dateFrom, 'yyyy-MM-dd'))
    if (dateTo) params.append('fecha_hasta', format(dateTo, 'yyyy-MM-dd'))
    if (selectedUser !== 'todos') params.append('usuario', selectedUser)
    params.append("page", dailyStatsPage.toString())
    params.append("per_page", dailyStatsPerPage.toString())

    try {
      const response = await fetch(`http://localhost:8000/api/audit-logs/daily-stats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const { data, period_totals } = await response.json()
      
      setDailyStats(Array.isArray(data.data) ? data.data : [])
      setDailyStatsTotalPages(data.last_page || 1)
      setDailyStatsTotalItems(data.total || 0)
      setPeriodTotals({
        libros: period_totals?.libros || 0,
        libros_anillados: period_totals?.libros_anillados || 0,
        azs: period_totals?.azs || 0,
        total: period_totals?.total || 0
      })
    } catch (error) {
      console.error("Error fetching daily stats:", error)
      setDailyStats([])
      setPeriodTotals({
        libros: 0,
        libros_anillados: 0,
        azs: 0,
        total: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (filterAction !== "todas") params.append("accion", filterAction)
    if (filterModule !== "todos") params.append("modulo", filterModule)
    if (filterUser !== "todos") params.append("usuario", filterUser)
    if (searchTerm) params.append("search", searchTerm)
    
    const token = localStorage.getItem("token") || ""
    fetch(`http://localhost:8000/api/audit-logs/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
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

  // Efectos
  useEffect(() => {
    fetchAuditLogs()
  }, [filterAction, filterModule, filterUser, searchTerm, auditLogsPage, auditLogsPerPage])

  useEffect(() => {
    fetchUserStats()
  }, [userStatsPage, userStatsPerPage])

  useEffect(() => {
    fetchDailyStats()
  }, [dateFrom, dateTo, selectedUser, dailyStatsPage, dailyStatsPerPage])

  // Cálculos
  const activitiesToday = auditLogs.filter(log => {
    const today = new Date().toISOString().split('T')[0]
    return log.created_at && log.created_at.includes(today)
  }).length

  const docsCreatedToday = auditLogs.filter(log => {
    const today = new Date().toISOString().split('T')[0]
    return log.accion === "crear" && log.modulo === "documentos" && 
           log.created_at && log.created_at.includes(today)
  }).length

  const averageSessionTime = userStats.length > 0 
    ? userStats.reduce((acc, stat) => {
        const [hours, minutes] = stat.tiempoSesion.split('h ').map(part => parseInt(part))
        return acc + (hours * 60 + minutes)
      }, 0) / userStats.length + 'm'
    : '0m'

  // Componente de paginación reutilizable
  type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
  };

  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    totalItems,
    itemsPerPage,
    onPageChange,
    onPerPageChange
  }: PaginationControlsProps) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      <div className="text-sm text-muted-foreground">
        Mostrando {(currentPage - 1) * itemsPerPage + 1} - 
        {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Por página:</Label>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="px-2 py-1 text-sm">Página</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = Math.min(Math.max(1, Number(e.target.value)), totalPages)
                onPageChange(page)
              }}
              className="w-16 text-center"
            />
            <span className="px-2 py-1 text-sm">de {totalPages}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )

  // Componentes
  const StatsCards = () => (
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
          <div className="text-2xl font-bold">{averageSessionTime}</div>
          <p className="text-xs text-muted-foreground">Sesión por usuario</p>
        </CardContent>
      </Card>
    </div>
  )

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

  const AuditLogTab = () => (
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
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log) => {
                  const { date, time } = formatDateTime(log.created_at)
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
                          onClick={() => {
                            setSelectedLog(log)
                            setIsViewDialogOpen(true)
                          }}
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
        
        {/* Paginación para Audit Logs */}
        <PaginationControls
          currentPage={auditLogsPage}
          totalPages={auditLogsTotalPages}
          totalItems={auditLogsTotalItems}
          itemsPerPage={auditLogsPerPage}
          onPageChange={setAuditLogsPage}
          onPerPageChange={(value) => {
            setAuditLogsPerPage(value)
            setAuditLogsPage(1)
          }}
        />
      </CardContent>
    </Card>
  )

  const UserStatsTab = () => (
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
                userStats.map((stat, index) => (
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
                       {formatColombiaTime(stat.ultimaactividad)}
                    </TableCell>
                  </TableRow>
                ))
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
        
        {/* Paginación para User Stats */}
        <PaginationControls
          currentPage={userStatsPage}
          totalPages={userStatsTotalPages}
          totalItems={userStatsTotalItems}
          itemsPerPage={userStatsPerPage}
          onPageChange={setUserStatsPage}
          onPerPageChange={(value) => {
            setUserStatsPerPage(value)
            setUserStatsPage(1)
          }}
        />
      </CardContent>
    </Card>
  )

  const ProductivityTab = () => (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Productividad Diaria por Tipo de Documento</CardTitle>
            <CardDescription>Cantidad de documentos digitados por usuario y por día</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={fetchDailyStats}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Label className="text-sm font-medium">Filtros rápidos:</Label>
            {[
              { value: "hoy", label: "Hoy" },
              { value: "ayer", label: "Ayer" },
              { value: "ultima-semana", label: "Última semana" },
              { value: "esta-semana", label: "Esta semana" },
              { value: "este-mes", label: "Este mes" },
              { value: "mes-anterior", label: "Mes anterior" },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  switch (filter.value) {
                    case "hoy":
                      setDateFrom(today)
                      setDateTo(today)
                      break
                    case "ayer":
                      setDateFrom(subDays(today, 1))
                      setDateTo(subDays(today, 1))
                      break
                    case "ultima-semana":
                      setDateFrom(subDays(today, 7))
                      setDateTo(today)
                      break
                    case "esta-semana":
                      setDateFrom(startOfWeek(today, { weekStartsOn: 1 }))
                      setDateTo(endOfWeek(today, { weekStartsOn: 1 }))
                      break
                    case "este-mes":
                      setDateFrom(startOfMonth(today))
                      setDateTo(endOfMonth(today))
                      break
                    case "mes-anterior":
                      const lastMonth = subDays(startOfMonth(today), 1)
                      setDateFrom(startOfMonth(lastMonth))
                      setDateTo(endOfMonth(lastMonth))
                      break
                  }
                }}
                disabled={loading}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Desde:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Hasta:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Usuario:</Label>
              <Select 
                value={selectedUser} 
                onValueChange={setSelectedUser}
                disabled={loading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los usuarios</SelectItem>
                  {uniqueDailyUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Libros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{periodTotals.libros}</div>
                <p className="text-xs text-muted-foreground">En el período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Libros Anillados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{periodTotals.libros_anillados}</div>
                <p className="text-xs text-muted-foreground">En el período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">AZS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{periodTotals.azs}</div>
                <p className="text-xs text-muted-foreground">En el período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">{periodTotals.total}</div>
                <p className="text-xs text-muted-foreground">En el período</p>
              </CardContent>
            </Card>
          </div>
        </div>

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : dailyStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No hay datos para el período seleccionado
                  </TableCell>
                </TableRow>
              ) : (
                [...dailyStats]
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                  .map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">
                        {stat.fecha ? format(new Date(stat.fecha), "dd/MM/yyyy", { locale: es }) : 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">{stat.user_id || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          {stat.libros || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {stat.libros_anillados || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-purple-100 text-purple-800">
                          {stat.azs || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-gray-800 text-white">
                          {stat.total || 0}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginación para Daily Stats */}
        <PaginationControls
          currentPage={dailyStatsPage}
          totalPages={dailyStatsTotalPages}
          totalItems={dailyStatsTotalItems}
          itemsPerPage={dailyStatsPerPage}
          onPageChange={setDailyStatsPage}
          onPerPageChange={(value) => {
            setDailyStatsPerPage(value)
            setDailyStatsPage(1)
          }}
        />

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
  )

  return (
    <div className="space-y-6">
      <StatsCards />

      <Tabs defaultValue="auditoria" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auditoria">Log de Auditoría</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas de Usuarios</TabsTrigger>
          <TabsTrigger value="productividad">Productividad Diaria</TabsTrigger>
        </TabsList>

        <TabsContent value="auditoria">
          <AuditLogTab />
        </TabsContent>

        <TabsContent value="estadisticas">
          <UserStatsTab />
        </TabsContent>

        <TabsContent value="productividad">
          <ProductivityTab />
        </TabsContent>
      </Tabs>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Actividad</DialogTitle>
            <DialogDescription>Información completa del registro de auditoría</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="font-medium">Detalles</Label>
                {(() => {
                  let detallesObj: any = {};
                  try {
                    detallesObj = JSON.parse(selectedLog.detalles || '{}');
                  } catch {
                    detallesObj = {};
                  }
                  const antes = detallesObj['antes'] || {};
                  const despues = detallesObj['después'] || {};
                  const tomos = detallesObj['tomos'];
                  const allKeys = Array.from(new Set([  
                    ...Object.keys(antes),
                    ...Object.keys(despues)
                  ]));
                  return (
                    <ul className="text-sm bg-muted p-2 rounded space-y-1">
                      {allKeys.length === 0 && (
                        <li className="text-muted-foreground">Sin detalles</li>
                      )}
                      {allKeys.map((key) => {
                        const isDateField = key === 'created_at' || key === 'updated_at';
                        const antesValue = antes[key];
                        const despuesValue = despues[key];
                        return (
                          <li key={key} className="flex gap-2 items-center">
                            <span className="font-semibold capitalize min-w-[120px]">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-blue-700">
                              {isDateField && antesValue ? formatColombiaTime(antesValue) : (antesValue !== undefined ? antesValue.toString() : '-')}
                            </span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="text-green-700">
                              {isDateField && despuesValue ? formatColombiaTime(despuesValue) : (despuesValue !== undefined ? despuesValue.toString() : '-')}
                            </span>
                          </li>
                        );
                      })}
                      {tomos !== undefined && (
                        <li className="flex gap-2">
                          <span className="font-semibold capitalize min-w-[120px]">Tomos:</span>
                          <span className="text-blue-700">-</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-green-700">{tomos}</span>
                        </li>
                      )}
                    </ul>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Dirección IP</Label>
                  <p className="text-sm bg-muted p-2 rounded font-mono">
                    {selectedLog.ip_address || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Navegador</Label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {selectedLog.navegador || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}