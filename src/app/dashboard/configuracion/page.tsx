"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Database, Shield, Bell, Palette, Check } from "lucide-react"
import { useState } from "react"

const colorPalettes = [
  {
    id: 1,
    name: "Opción 1 - Natural",
    colors: ["#FAF1E6", "#FDFAF6", "#E4EFE7", "#064420"],
    description: "Tonos naturales y tierra",
  },
  {
    id: 2,
    name: "Opción 2 - Cálido",
    colors: ["#FFFAEC", "#F5ECD5", "#578E7E", "#3D3D3D"],
    description: "Paleta cálida y acogedora",
  },
  {
    id: 3,
    name: "Opción 3 - Vibrante",
    colors: ["#EEEEEE", "#234C63", "#379956", "#FFC85B"],
    description: "Colores vibrantes y energéticos",
  },
  {
    id: 4,
    name: "Opción 4 - Profesional",
    colors: ["#F8F1F1", "#11698E", "#19456B", "#16C79A"],
    description: "Estilo profesional y moderno",
  },
]

export default function ConfiguracionPage() {
  const [selectedPalette, setSelectedPalette] = useState<number>(1)

  const handlePaletteChange = (paletteId: number) => {
    setSelectedPalette(paletteId)
    // Aquí aplicarías los colores al tema del sistema
    const palette = colorPalettes.find((p) => p.id === paletteId)
    if (palette) {
      // Aplicar colores CSS custom properties
      document.documentElement.style.setProperty("--color-primary", palette.colors[2])
      document.documentElement.style.setProperty("--color-secondary", palette.colors[1])
      document.documentElement.style.setProperty("--color-background", palette.colors[0])
      document.documentElement.style.setProperty("--color-accent", palette.colors[3])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
        <p className="text-muted-foreground">Administra la configuración general del sistema de biblioteca</p>
      </div>

      <div className="grid gap-6">
        {/* Configuración de Tema y Colores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema y Colores
            </CardTitle>
            <CardDescription>
              Personaliza la apariencia del sistema con paletas de colores predeterminadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Selecciona una paleta de colores:</Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {colorPalettes.map((palette) => (
                  <div
                    key={palette.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedPalette === palette.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handlePaletteChange(palette.id)}
                  >
                    {selectedPalette === palette.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{palette.name}</h3>
                      </div>

                      <p className="text-sm text-muted-foreground">{palette.description}</p>

                      <div className="flex gap-2">
                        {palette.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-md border border-border shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {palette.colors.map((color, index) => (
                          <div key={index} className="font-mono text-muted-foreground">
                            {color}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base font-medium">Vista previa del tema:</Label>

              <div
                className="p-4 border rounded-lg space-y-4"
                style={{
                  backgroundColor: colorPalettes.find((p) => p.id === selectedPalette)?.colors[0],
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Ejemplo de interfaz</h4>
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: colorPalettes.find((p) => p.id === selectedPalette)?.colors[2],
                      color: "white",
                    }}
                  >
                    Botón Principal
                  </Button>
                </div>

                <div
                  className="p-3 rounded border"
                  style={{
                    backgroundColor: colorPalettes.find((p) => p.id === selectedPalette)?.colors[1],
                  }}
                >
                  <p className="text-sm">Este es un ejemplo de cómo se verá el contenido con la paleta seleccionada.</p>
                </div>

                <div className="flex gap-2">
                  <div
                    className="px-3 py-1 rounded text-xs font-medium text-white"
                    style={{
                      backgroundColor: colorPalettes.find((p) => p.id === selectedPalette)?.colors[3],
                    }}
                  >
                    Etiqueta
                  </div>
                  <div
                    className="px-3 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: colorPalettes.find((p) => p.id === selectedPalette)?.colors[1],
                      color: colorPalettes.find((p) => p.id === selectedPalette)?.colors[3],
                    }}
                  >
                    Secundaria
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="tema-oscuro" />
              <Label htmlFor="tema-oscuro">Habilitar modo oscuro automático</Label>
            </div>

            <Button>
              <Save className="mr-2 h-4 w-4" />
              Aplicar Tema Seleccionado
            </Button>
          </CardContent>
        </Card>

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
