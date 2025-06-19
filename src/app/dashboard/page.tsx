"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Upload,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Target,
  Award,
  AlertCircle,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Legend,
  Pie,
} from "recharts"

// Datos de ejemplo para gráficos
const documentosPorTipo = [
  { tipo: "Libros", cantidad: 156, porcentaje: 52 },
  { tipo: "Libros Anillados", cantidad: 89, porcentaje: 30 },
  { tipo: "AZS", cantidad: 54, porcentaje: 18 },
]

const documentosPorDenominacion = [
  { denominacion: "MI", nombre: "Memoria Institucional", cantidad: 45, color: "#3B82F6" },
  { denominacion: "CG", nombre: "Colección General", cantidad: 128, color: "#10B981" },
  { denominacion: "J", nombre: "Jurídico", cantidad: 67, color: "#8B5CF6" },
  { denominacion: "R", nombre: "Revistas", cantidad: 34, color: "#F59E0B" },
  { denominacion: "H", nombre: "Hemeroteca", cantidad: 25, color: "#EF4444" },
]

const actividadMensual = [
  { mes: "Ene", documentos: 12, usuarios: 8, consultas: 145 },
  { mes: "Feb", documentos: 19, usuarios: 12, consultas: 189 },
  { mes: "Mar", documentos: 15, usuarios: 10, consultas: 167 },
  { mes: "Abr", documentos: 22, usuarios: 15, consultas: 234 },
  { mes: "May", documentos: 28, usuarios: 18, consultas: 298 },
  { mes: "Jun", documentos: 31, usuarios: 22, consultas: 356 },
  { mes: "Jul", documentos: 25, usuarios: 19, consultas: 289 },
  { mes: "Ago", documentos: 33, usuarios: 24, consultas: 412 },
  { mes: "Sep", documentos: 29, usuarios: 21, consultas: 378 },
  { mes: "Oct", documentos: 35, usuarios: 26, consultas: 445 },
  { mes: "Nov", documentos: 38, usuarios: 28, consultas: 489 },
  { mes: "Dic", documentos: 42, usuarios: 31, consultas: 523 },
]

const documentosPorAño = [
  { año: "2020", cantidad: 45 },
  { año: "2021", cantidad: 67 },
  { año: "2022", cantidad: 89 },
  { año: "2023", cantidad: 123 },
  { año: "2024", cantidad: 75 },
]

const usuariosActivos = [
  { nombre: "Juan Pérez", documentos: 45, consultas: 123, ultimaActividad: "Hace 2 horas" },
  { nombre: "María García", documentos: 38, consultas: 98, ultimaActividad: "Hace 4 horas" },
  { nombre: "Carlos López", documentos: 32, consultas: 87, ultimaActividad: "Hace 1 día" },
  { nombre: "Ana Martínez", documentos: 28, consultas: 156, ultimaActividad: "Hace 3 horas" },
  { nombre: "Luis Rodríguez", documentos: 24, consultas: 76, ultimaActividad: "Hace 2 días" },
]

const actividadReciente = [
  {
    id: 1,
    usuario: "Juan Pérez",
    accion: "Creó documento",
    detalle: "MI0045 - Memoria Anual 2024",
    tiempo: "Hace 15 minutos",
    tipo: "crear",
  },
  {
    id: 2,
    usuario: "María García",
    accion: "Editó documento",
    detalle: "CG0123 - Manual de Procedimientos",
    tiempo: "Hace 32 minutos",
    tipo: "editar",
  },
  {
    id: 3,
    usuario: "Carlos López",
    accion: "Consultó catálogo",
    detalle: "Búsqueda: documentos jurídicos",
    tiempo: "Hace 1 hora",
    tipo: "consultar",
  },
  {
    id: 4,
    usuario: "Ana Martínez",
    accion: "Descargó archivo",
    detalle: "J0034-T2 - Código Civil Tomo II",
    tiempo: "Hace 2 horas",
    tipo: "descargar",
  },
  {
    id: 5,
    usuario: "Luis Rodríguez",
    accion: "Creó documento",
    detalle: "R0012 - Revista Científica Vol. 8",
    tiempo: "Hace 3 horas",
    tipo: "crear",
  },
]

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"]

export default function Dashboard() {
  const getActionIcon = (tipo: string) => {
    switch (tipo) {
      case "crear":
        return <Upload className="h-4 w-4 text-green-600" />
      case "editar":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "consultar":
        return <BookOpen className="h-4 w-4 text-purple-600" />
      case "descargar":
        return <Download className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionBadge = (tipo: string) => {
    const variants = {
      crear: "bg-green-100 text-green-800",
      editar: "bg-blue-100 text-blue-800",
      consultar: "bg-purple-100 text-purple-800",
      descargar: "bg-orange-100 text-orange-800",
    }
    return variants[tipo as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
          <Button size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Análisis Completo
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1%</span> desde el mes pasado
            </p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Registros</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> desde la semana pasada
            </p>
            <Progress value={60} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> desde ayer
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Mensuales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> desde el mes pasado
            </p>
            <Progress value={90} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de actividad mensual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Actividad Mensual
            </CardTitle>
            <CardDescription>Documentos registrados y consultas por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={actividadMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="documentos"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Documentos"
                />
                <Area
                  type="monotone"
                  dataKey="consultas"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Consultas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por denominación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Documentos por Denominación
            </CardTitle>
            <CardDescription>Distribución de documentos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={documentosPorDenominacion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="cantidad"
                  label={({ denominacion, cantidad }) => `${denominacion}: ${cantidad}`}
                >
                  {documentosPorDenominacion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con más información */}
      <Tabs defaultValue="estadisticas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="estadisticas">Estadísticas Detalladas</TabsTrigger>
          <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios Activos</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
        </TabsList>

        {/* Tab de estadísticas */}
        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Documentos por tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Tipo</CardTitle>
                <CardDescription>Distribución de documentos según su tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={documentosPorTipo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Documentos por año */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Año de Publicación</CardTitle>
                <CardDescription>Distribución temporal de los documentos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={documentosPorAño}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="año" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="cantidad"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas adicionales */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Digitalización</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <Progress value={94.2} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">1,162 de 1,234 documentos digitalizados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.3</div>
                <p className="text-xs text-muted-foreground">documentos registrados por día</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+15% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5 min</div>
                <p className="text-xs text-muted-foreground">por registro de documento</p>
                <div className="flex items-center mt-2">
                  <Award className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">Eficiencia mejorada</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de actividad reciente */}
        <TabsContent value="actividad">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actividadReciente.map((actividad) => (
                  <div key={actividad.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div className="flex-shrink-0">{getActionIcon(actividad.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{actividad.usuario}</p>
                        <Badge className={getActionBadge(actividad.tipo)}>{actividad.accion}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{actividad.detalle}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">{actividad.tiempo}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de usuarios activos */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuarios Más Activos
              </CardTitle>
              <CardDescription>Ranking de usuarios por actividad en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usuariosActivos.map((usuario, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{usuario.nombre}</p>
                        <p className="text-xs text-muted-foreground">{usuario.ultimaActividad}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="font-medium text-blue-600">{usuario.documentos}</span>
                          <span className="text-muted-foreground ml-1">docs</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">{usuario.consultas}</span>
                          <span className="text-muted-foreground ml-1">consultas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de tendencias */}
        <TabsContent value="tendencias">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias de Crecimiento
                </CardTitle>
                <CardDescription>Análisis de crecimiento y proyecciones</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={actividadMensual}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="documentos"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Documentos Registrados"
                    />
                    <Line type="monotone" dataKey="usuarios" stroke="#10B981" strokeWidth={2} name="Usuarios Activos" />
                    <Line type="monotone" dataKey="consultas" stroke="#8B5CF6" strokeWidth={2} name="Consultas" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alertas y recomendaciones */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                    Alertas del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Espacio de almacenamiento</p>
                      <p className="text-xs text-muted-foreground">85% del espacio utilizado</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Documentos pendientes</p>
                      <p className="text-xs text-muted-foreground">12 documentos sin digitalizar</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Award className="h-5 w-5" />
                    Logros del Mes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Award className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Meta de digitalización</p>
                      <p className="text-xs text-muted-foreground">Superada en un 120%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Award className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Usuarios más activos</p>
                      <p className="text-xs text-muted-foreground">Incremento del 25% en participación</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
