"use client"

import { useState, useEffect } from "react"
import api from "@/lib/axios"
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
import { Search, Eye, Edit, Download, BookOpen, FileText, Trash2, Plus, Upload } from "lucide-react"
import axios from "axios"

// Definir interfaz para los tomos - Acepta string o number
interface Tomo {
  id: string | number;
  numero: number;
  archivo: string;
  newFile?: File | null;
}

interface Document {
  id: string
  denominacion_numerica: string
  tipo_documento: "LIBROS" | "LIBROS_ANILLADOS" | "AZS"
  denominacion: "MI" | "CG" | "J" | "R" | "H"
  titulo: string
  autor: string
  editorial: string
  año: string
  pais: string
  created_at: string
  tomos: Tomo[];
}

const denominationLabels = {
  MI: "Memoria Institucional",
  CG: "Colección General",
  J: "Jurídico",
  R: "Revistas",
  H: "Hemeroteca",
}

export default function ConsultasPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("todos")
  const [filterDenomination, setFilterDenomination] = useState<string>("todos")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [tomosEliminados, setTomosEliminados] = useState<string[]>([])

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/bibliotecas`)
        const docs = Array.isArray(response.data)
          ? response.data.map((doc: any) => ({
            ...doc,
            tomos: doc.tomos || []
          }))
          : Array.isArray(response.data?.data)
            ? response.data.data.map((doc: any) => ({
              ...doc,
              tomos: doc.tomos || []
            }))
            : []
        setDocuments(docs)
      } catch (error) {
        console.error("Error al obtener documentos:", error)
      }
    }

    fetchDocuments()
  }, [])

  // Filtrar documentos
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.denominacion_numerica.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType =
      filterType === "todos" || doc.tipo_documento.toLowerCase() === filterType.toLowerCase()

    const matchesDenomination =
      filterDenomination === "todos" || doc.denominacion.toLowerCase() === filterDenomination.toLowerCase()

    return matchesSearch && matchesType && matchesDenomination
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage) || 1
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentDocuments = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem)

  // Ajustar página si es necesario
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [filteredDocuments, itemsPerPage])

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsViewDialogOpen(true)
  }

  const handleEditDocument = (document: Document) => {
    setEditingDocument({ 
      ...document,
      tomos: document.tomos.map(tomo => ({ ...tomo }))
    })
    setTomosEliminados([])
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingDocument) return;

    try {
      const formData = new FormData();
      
      // Campos principales
      formData.append('_method', 'PUT');
      formData.append('tipo_documento', editingDocument.tipo_documento);
      formData.append('denominacion', editingDocument.denominacion);
      formData.append('denominacion_numerica', editingDocument.denominacion_numerica);
      formData.append('titulo', editingDocument.titulo);
      formData.append('autor', editingDocument.autor);
      formData.append('editorial', editingDocument.editorial || '');
      formData.append('año', editingDocument.año);
      formData.append('pais', editingDocument.pais);
      
      // Tomos eliminados
      if (tomosEliminados.length > 0) {
        formData.append('tomos_eliminados', JSON.stringify(tomosEliminados));
      }
      
      // Procesar tomos - CONVERSIÓN SEGURA A STRING
      editingDocument.tomos.forEach((tomo, index) => {
        formData.append(`tomos[${index}][numero]`, tomo.numero.toString());
        
        // Convertir ID a string antes de verificar
        const tomoId = String(tomo.id);
        
        if (tomoId && !tomoId.startsWith('new-')) {
          formData.append(`tomos[${index}][id]`, tomoId);
        }
        
        if (tomo.newFile) {
          formData.append(`tomos[${index}][archivo]`, tomo.newFile);
        }
      });
      
      // Enviar solicitud
      const response = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bibliotecas/${editingDocument.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Actualizar estado
      setDocuments(documents.map(doc => 
        doc.id === editingDocument.id ? response.data.data : doc
      ));
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      setTomosEliminados([]);
      
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
      
      // Mostrar errores específicos
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        console.error("Errores de validación:", error.response.data.errors);
        alert("Errores de validación: " + JSON.stringify(error.response.data.errors));
      } else {
        alert("Error al actualizar el documento. Por favor, intente nuevamente.");
      }
    }
  };

  const handleDescargarPDF = async (fileName: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bibliotecas/descargar`,
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          },
          responseType: "blob",
          params: { 
            file: fileName 
          }
        }
      );

      const mimeType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          alert("Archivo no encontrado en el servidor");
        } else if (error.response?.status === 401) {
          alert("No autorizado - por favor inicie sesión nuevamente");
        } else {
          alert(`Error del servidor: ${error.response?.status}`);
        }
      } else {
        alert("Error desconocido al descargar el archivo");
      }
    }
  };

  const getTypeBadge = (tipo_documento: string) => {
    const variants = {
      libros: "default",
      "libros_anillados": "secondary",
      azs: "outline",
    } as const

    const labels = {
      libros: "Libros",
      "libros_anillados": "Libros Anillados",
      azs: "AZS",
    }

    const tipoDocumentoNormalizado = tipo_documento.toLowerCase()

    return (
      <Badge variant={variants[tipoDocumentoNormalizado as keyof typeof variants]}>
        {labels[tipoDocumentoNormalizado as keyof typeof labels]}
      </Badge>
    )
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

  // Funciones para manejar tomos en edición
  const handleAddTomoEdit = () => {
    setEditingDocument(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tomos: [
          ...prev.tomos, 
          { 
            id: `new-${Date.now()}`,
            numero: prev.tomos.length + 1, 
            archivo: "",
            newFile: null
          }
        ]
      };
    });
  };

  const handleRemoveTomoEdit = (index: number) => {
    setEditingDocument(prev => {
      if (!prev) return prev;
      
      const tomo = prev.tomos[index];
      // Convertir ID a string antes de verificar
      const tomoId = String(tomo.id);
      
      if (tomoId && !tomoId.startsWith('new-')) {
        setTomosEliminados(prevIds => [...prevIds, tomoId]);
      }
      
      const newTomos = [...prev.tomos];
      newTomos.splice(index, 1);
      return { ...prev, tomos: newTomos };
    });
  };

  const handleTomoNumberChangeEdit = (index: number, value: string) => {
    setEditingDocument(prev => {
      if (!prev) return prev;
      const newTomos = [...prev.tomos];
      newTomos[index] = {
        ...newTomos[index],
        numero: parseInt(value) || 0
      };
      return { ...prev, tomos: newTomos };
    });
  };

  const handleTomoFileChangeEdit = (index: number, file: File | null) => {
    setEditingDocument(prev => {
      if (!prev) return prev;
      const newTomos = [...prev.tomos];
      newTomos[index] = {
        ...newTomos[index],
        newFile: file,
        archivo: file ? file.name : newTomos[index].archivo
      };
      return { ...prev, tomos: newTomos };
    });
  };

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{documents.filter((d) => d.tipo_documento === "LIBROS").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Libros Anillados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter((d) => d.tipo_documento === "LIBROS_ANILLADOS").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AZS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter((d) => d.tipo_documento === "AZS").length}</div>
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
                <SelectItem value="libros">Libros</SelectItem>
                <SelectItem value="libros_anillados">Libros Anillados</SelectItem>
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

          {/* Controles de paginación */}
          {filteredDocuments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Documentos por página</p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 30, 50].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  {filteredDocuments.length === 0
                    ? 0
                    : `${indexOfFirstItem + 1}-${Math.min(
                      indexOfLastItem,
                      filteredDocuments.length
                    )}`}{" "}
                  de {filteredDocuments.length} documentos
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center justify-center text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                  <TableHead>Tomos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.denominacion_numerica}</TableCell>
                    <TableCell className="max-w-xs truncate">{document.titulo}</TableCell>
                    <TableCell>{document.autor}</TableCell>
                    <TableCell>{getTypeBadge(document.tipo_documento)}</TableCell>
                    <TableCell>{getDenominationBadge(document.denominacion)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {(document.tomos ? document.tomos.length : 0)} tomo{(document.tomos ? document.tomos.length : 0) !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
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
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.denominacion_numerica}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Tipo de Documento</Label>
                  <div className="flex items-center">{getTypeBadge(selectedDocument.tipo_documento)}</div>
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
                  <Label className="font-medium">Año</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.año}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">País</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedDocument.pais}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Fecha de Registro</Label>
                <p className="text-sm bg-muted p-2 rounded">
                  {new Date(selectedDocument.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Sección de Tomos */}
              <div className="space-y-2">
                <Label className="font-medium">Tomos</Label>
                <div className="space-y-2">
                  {selectedDocument.tomos && selectedDocument.tomos.length > 0 ? (
                    selectedDocument.tomos.map((tomo) => (
                      <div key={tomo.id} className="flex items-center justify-between bg-muted p-2 rounded">
                        <div>
                          <span className="font-medium">Tomo {tomo.numero}:</span> {tomo.archivo}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDescargarPDF(tomo.archivo)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay tomos registrados</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>Modifica la información del documento y sus tomos</DialogDescription>
          </DialogHeader>
          {editingDocument && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-codigo">Código</Label>
                  <Input
                    id="edit-codigo"
                    value={editingDocument.denominacion_numerica}
                    onChange={(e) => setEditingDocument({ ...editingDocument, denominacion_numerica: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tipo">Tipo</Label>
                  <Select
                    value={editingDocument.tipo_documento.toLowerCase()}
                    onValueChange={(value: "libros" | "libros_anillados" | "azs") =>
                      setEditingDocument({ ...editingDocument, tipo_documento: value.toUpperCase() as "LIBROS" | "LIBROS_ANILLADOS" | "AZS" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="libros">Libros</SelectItem>
                      <SelectItem value="libros_anillados">Libros Anillados</SelectItem>
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

              {/* Sección de Tomos para edición */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Tomos</Label>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleAddTomoEdit()}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Agregar tomo
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {editingDocument.tomos.map((tomo, index) => (
                    <div key={tomo.id} className="border rounded-lg p-4 flex flex-col gap-3 relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveTomoEdit(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`edit-tomo-numero-${index}`}>Número de Tomo</Label>
                        <Input
                          id={`edit-tomo-numero-${index}`}
                          type="number"
                          value={tomo.numero}
                          onChange={(e) => handleTomoNumberChangeEdit(index, e.target.value)}
                          placeholder="Número de tomo"
                          min={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Archivo PDF</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {tomo.archivo ? `Archivo actual: ${tomo.archivo}` : "Ningún archivo seleccionado"}
                            </p>
                            <Input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                // Validación de tipo de archivo
                                if (file && file.type !== 'application/pdf') {
                                  alert('Solo se permiten archivos PDF');
                                  e.target.value = ''; // Limpiar input
                                  return;
                                }
                                handleTomoFileChangeEdit(index, file || null);
                              }}
                              className="max-w-xs mx-auto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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