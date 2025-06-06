"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Edit, Download, BookOpen, FileText } from "lucide-react"

interface Document {
  id: string
  codigo: string
  tipo: "libro" | "libro-anillado" | "azs"
  denominacion: "MI" | "CG" | "J" | "R" | "H"
  titulo: string
  autor: string
  editorial: string
  tomo: string
  año: string
  pais: string
  fechaRegistro: string
  archivo: string
}

// Datos de ejemplo
const initialDocuments: Document[] = [
  {
    id: "1",
    codigo: "MI0001",
    tipo: "libro",
    denominacion: "MI",
    titulo: "Historia de la Institución Educativa",
    autor: "Dr. Carlos Mendoza",
    editorial: "Editorial Académica",
    tomo: "1",
    año: "2023",
    pais: "Colombia",
    fechaRegistro: "2024-01-15",
    archivo: "historia_institucion.pdf",
  },
  {
    id: "2",
    codigo: "CG0025",
    tipo: "libro-anillado",
    denominacion: "CG",
    titulo: "Manual de Procedimientos Administrativos",
    autor: "María García López",
    editorial: "",
    tomo: "",
    año: "2024",
    pais: "Colombia",
    fechaRegistro: "2024-02-20",
    archivo: "manual_procedimientos.pdf",
  },
  {
    id: "3",
    codigo: "J0012",
    tipo: "libro",
    denominacion: "J",
    titulo: "Código Civil Comentado",
    autor: "Alejandro Pérez Ruiz",
    editorial: "Jurídica Nacional",
    tomo: "2",
    año: "2023",
    pais: "Colombia",
    fechaRegistro: "2024-03-10",
    archivo: "codigo_civil_comentado.pdf",
  },
  {
    id: "4",
    codigo: "R0008",
    tipo: "azs",
    denominacion: "R",
    titulo: "Revista de Investigación Científica Vol. 15",
    autor: "Varios Autores",
    editorial: "Universidad Nacional",
    tomo: "",
    año: "2024",
    pais: "Colombia",
    fechaRegistro: "2024-04-05",
    archivo: "revista_investigacion_vol15.pdf",
  },
  {
    id: "5",
    codigo: "H0003",
    tipo: "libro",
    denominacion: "H",
    titulo: "Periódico El Diario - Edición Especial",
    autor: "Equipo Editorial",
    editorial: "El Diario S.A.",
    tomo: "",
    año: "2024",
    pais: "Colombia",
    fechaRegistro: "2024-04-12",
    archivo: "periodico_edicion_especial.pdf",
  },
  {
    id: "6",
    codigo: "MI0002",
    tipo: "libro",
    denominacion: "MI",
    titulo: "Memoria Anual de Actividades 2023",
    autor: "Comité Directivo",
    editorial: "",
    tomo: "",
    año: "2023",
    pais: "Colombia",
    fechaRegistro: "2024-01-25",
    archivo: "memoria_anual_2023.pdf",
  },
  {
    id: "7",
    codigo: "CG0026",
    tipo: "libro-anillado",
    denominacion: "CG",
    titulo: "Guía de Buenas Prácticas Pedagógicas",
    autor: "Ana Martínez Silva",
    editorial: "Educativa Plus",
    tomo: "",
    año: "2024",
    pais: "Colombia",
    fechaRegistro: "2024-03-15",
    archivo: "guia_buenas_practicas.pdf",
  },
]

const denominationLabels = {
  MI: "Memoria Institucional",
  CG: "Colección General",
  J: "Jurídico",
  R: "Revistas",
  H: "Hemeroteca",
}

export default function ConsultasPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("todos")
  const [filterDenomination, setFilterDenomination] = useState<string>("todos")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  // Filtrar documentos
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "todos" || doc.tipo === filterType
    const matchesDenomination = filterDenomination === "todos" || doc.denominacion === filterDenomination

    return matchesSearch && matchesType && matchesDenomination
  })

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsViewDialogOpen(true)
  }

  const handleEditDocument = (document: Document) => {
    setEditingDocument({ ...document })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingDocument) {
      setDocuments(documents.map((doc) => (doc.id === editingDocument.id ? editingDocument : doc)))
      setIsEditDialogOpen(false)
      setEditingDocument(null)
    }
  }

  const getTypeBadge = (tipo: string) => {
    const variants = {
      libro: "default",
      "libro-anillado": "secondary",
      azs: "outline",
    } as const

    const labels = {
      libro: "Libro",
      "libro-anillado": "Libro Anillado",
      azs: "AZS",
    }

    return <Badge variant={variants[tipo as keyof typeof variants]}>{labels[tipo as keyof typeof labels]}</Badge>
  }

  const getDenominationBadge = (denominacion: string) => {
    const colors = {
      MI: "bg-blue-100 text-blue-800",
      CG: "bg-green-100 text-green-800",
      J: "bg-purple-100 text-purple-800",
      R: "bg-orange-100 text-orange-800",
      H: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={colors[denominacion as keyof typeof colors]}>
        {denominacion} - {denominationLabels[denominacion as keyof typeof denominationLabels]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consulta de Documentos</h1>
        <p className="text-muted-foreground">Busca y consulta todos los documentos registrados en el sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Libros</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter((d) => d.tipo === "libro").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Libros Anillados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter((d) => d.tipo === "libro-anillado").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AZS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter((d) => d.tipo === "azs").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de documentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Catálogo de Documentos</CardTitle>
              <CardDescription>Lista completa de documentos registrados</CardDescription>
            </div>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, autor o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="libro">Libro</SelectItem>
                <SelectItem value="libro-anillado">Libro Anillado</SelectItem>
                <SelectItem value="azs">AZS</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDenomination} onValueChange={setFilterDenomination}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Denominación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las denominaciones</SelectItem>
                <SelectItem value="MI">MI - Memoria Institucional</SelectItem>
                <SelectItem value="CG">CG - Colección General</SelectItem>
                <SelectItem value="J">J - Jurídico</SelectItem>
                <SelectItem value="R">R - Revistas</SelectItem>
                <SelectItem value="H">H - Hemeroteca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Denominación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.codigo}</TableCell>
                    <TableCell className="max-w-xs truncate">{document.titulo}</TableCell>
                    <TableCell>{document.autor}</TableCell>
                    <TableCell>{getTypeBadge(document.tipo)}</TableCell>
                    <TableCell>{getDenominationBadge(document.denominacion)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(document)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDocument(document)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron documentos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de visualización */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Documento</DialogTitle>
            <DialogDescription>Información completa del documento seleccionado</DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Código</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.codigo}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Tipo de Documento</Label>
                  <div className="flex items-center">{getTypeBadge(selectedDocument.tipo)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Denominación</Label>
                <div className="flex items-center">{getDenominationBadge(selectedDocument.denominacion)}</div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Título</Label>
                <p className="text-sm bg-muted p-2 rounded">{selectedDocument.titulo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Autor</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.autor}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Editorial</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.editorial || "No especificada"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Tomo</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.tomo || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Año</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.año}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">País</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.pais}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Fecha de Registro</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.fechaRegistro}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Archivo</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.archivo}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => alert("Función de descarga no implementada")}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>Modifica la información del documento</DialogDescription>
          </DialogHeader>
          {editingDocument && (
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-codigo">Código</Label>
                  <Input
                    id="edit-codigo"
                    value={editingDocument.codigo}
                    onChange={(e) => setEditingDocument({ ...editingDocument, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tipo">Tipo</Label>
                  <Select
                    value={editingDocument.tipo}
                    onValueChange={(value: "libro" | "libro-anillado" | "azs") =>
                      setEditingDocument({ ...editingDocument, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="libro">Libro</SelectItem>
                      <SelectItem value="libro-anillado">Libro Anillado</SelectItem>
                      <SelectItem value="azs">AZS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-titulo">Título</Label>
                <Input
                  id="edit-titulo"
                  value={editingDocument.titulo}
                  onChange={(e) => setEditingDocument({ ...editingDocument, titulo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-autor">Autor</Label>
                  <Input
                    id="edit-autor"
                    value={editingDocument.autor}
                    onChange={(e) => setEditingDocument({ ...editingDocument, autor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-editorial">Editorial</Label>
                  <Input
                    id="edit-editorial"
                    value={editingDocument.editorial}
                    onChange={(e) => setEditingDocument({ ...editingDocument, editorial: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tomo">Tomo</Label>
                  <Input
                    id="edit-tomo"
                    value={editingDocument.tomo}
                    onChange={(e) => setEditingDocument({ ...editingDocument, tomo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-año">Año</Label>
                  <Input
                    id="edit-año"
                    value={editingDocument.año}
                    onChange={(e) => setEditingDocument({ ...editingDocument, año: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pais">País</Label>
                  <Input
                    id="edit-pais"
                    value={editingDocument.pais}
                    onChange={(e) => setEditingDocument({ ...editingDocument, pais: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
