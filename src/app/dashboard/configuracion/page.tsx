"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Database, Shield, Bell } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
        <p className="text-muted-foreground">Administra la configuración general del sistema de biblioteca</p>
      </div>

      <div className="grid gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración General
            </CardTitle>
            <CardDescription>Configuración básica del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre-sistema">Nombre del Sistema</Label>
                <Input id="nombre-sistema" defaultValue="BiblioSoft" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institucion">Institución</Label>
                <Input id="institucion" placeholder="Nombre de la institución" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" placeholder="Dirección de la biblioteca" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" placeholder="Número de teléfono" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" placeholder="Descripción de la biblioteca" />
            </div>

            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Configuración de Base de Datos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de Datos
            </CardTitle>
            <CardDescription>Configuración de la conexión a la base de datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-host">Servidor</Label>
                <Input id="db-host" defaultValue="localhost" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="db-port">Puerto</Label>
                <Input id="db-port" defaultValue="5432" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="db-name">Nombre de la Base de Datos</Label>
                <Input id="db-name" defaultValue="biblioteca_db" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="db-user">Usuario</Label>
                <Input id="db-user" defaultValue="admin" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="backup-automatico" />
              <Label htmlFor="backup-automatico">Respaldo automático diario</Label>
            </div>

            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Configuración de Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>Configuración de seguridad y acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de dos factores</Label>
                  <p className="text-sm text-muted-foreground">Requiere verificación adicional para el acceso</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sesiones múltiples</Label>
                  <p className="text-sm text-muted-foreground">Permite múltiples sesiones por usuario</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="tiempo-sesion">Tiempo de sesión (minutos)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tiempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intentos-login">Intentos de login fallidos</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Número de intentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 intentos</SelectItem>
                    <SelectItem value="5">5 intentos</SelectItem>
                    <SelectItem value="10">10 intentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>Configuración de notificaciones del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificaciones importantes por correo</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de nuevos usuarios</Label>
                  <p className="text-sm text-muted-foreground">Notificar cuando se registre un nuevo usuario</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de nuevos documentos</Label>
                  <p className="text-sm text-muted-foreground">Notificar cuando se agregue un nuevo documento</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="email-admin">Email del administrador</Label>
                <Input id="email-admin" type="email" placeholder="admin@biblioteca.com" />
              </div>
            </div>

            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
