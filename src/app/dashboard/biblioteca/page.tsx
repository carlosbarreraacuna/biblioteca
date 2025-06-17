"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowLeft, ArrowRight, Save, Loader2, Plus, Trash2, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import paises from "@/app/paisesJson/paises.json"

type DocumentType = "libros" | "libros_anillados" | "azs" | ""
type Denomination = "MI" | "CG" | "J" | "R" | "H" | ""

interface Tomo {
  numero: number
  archivo: File | null
  error?: string
}

interface DocumentData {
  type: DocumentType
  denomination: Denomination
  consecutivo: string
  titulo: string
  autor: string
  editorial: string
  año: string
  pais: string
  tomos: Tomo[]
}

const denominationLabels = {
  MI: "Memoria Institucional",
  CG: "Colección General",
  J: "Jurídico",
  R: "Revistas",
  H: "Hemeroteca",
}

export default function BibliotecaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [documentData, setDocumentData] = useState<DocumentData>({
    type: "",
    denomination: "",
    consecutivo: "",
    titulo: "",
    autor: "",
    editorial: "",
    año: "",
    pais: "",
    tomos: [{ numero: 1, archivo: null }],
  })

  const handleDenominationChange = (value: Denomination) => {
    setDocumentData((prev) => ({
      ...prev,
      denomination: value,
      consecutivo: "",
    }))
  }

  const handleAddTomo = () => {
    const nextNumero = documentData.tomos.length + 1;
    
    setDocumentData(prev => ({
      ...prev,
      tomos: [...prev.tomos, { 
        numero: nextNumero, 
        archivo: null 
      }]
    }))
  }

  const handleRemoveTomo = (index: number) => {
    if (documentData.tomos.length <= 1) return
    
    setDocumentData(prev => {
      const newTomos = prev.tomos.filter((_, i) => i !== index);
      
      // Reasignar números consecutivos
      const tomosRenumerados = newTomos.map((tomo, idx) => ({
        ...tomo,
        numero: idx + 1
      }));
      
      return { ...prev, tomos: tomosRenumerados };
    })
  }

  const handleTomoFileChange = (index: number, file: File | null) => {
    // Limpiar errores previos
    setSaveError("");
    
    if (file) {
      // Validación doble: tipo MIME y extensión
      const isPDF = file.type === "application/pdf";
      const isPDFExtension = file.name.toLowerCase().endsWith(".pdf");
      
      if (!isPDF || !isPDFExtension) {
        // Actualizar estado con error específico para este tomo
        setDocumentData(prev => {
          const newTomos = [...prev.tomos];
          newTomos[index] = { 
            ...newTomos[index], 
            archivo: null,
            error: "El archivo debe ser un PDF válido (tipo MIME: application/pdf)"
          };
          return { ...prev, tomos: newTomos };
        });
        
        setSaveError("Por favor selecciona un archivo PDF válido");
        return;
      }
    }
    
    // Actualizar estado con nuevo archivo
    setDocumentData(prev => {
      const newTomos = [...prev.tomos];
      newTomos[index] = { 
        ...newTomos[index], 
        archivo: file,
        error: undefined // Limpiar error si existía
      };
      return { ...prev, tomos: newTomos };
    });
  }

  const handleSave = async () => {
    // Verificar archivos faltantes o inválidos
    const hasInvalidFiles = documentData.tomos.some(tomo => {
      return !tomo.archivo || tomo.error;
    });
    
    if (hasInvalidFiles) {
      setSaveError("Por favor selecciona un archivo PDF válido para cada tomo");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const formData = new FormData();
      formData.append('tipo_documento', documentData.type);
      formData.append('denominacion', documentData.denomination);
      formData.append('denominacion_numerica', documentData.consecutivo);
      formData.append('titulo', documentData.titulo);
      formData.append('autor', documentData.autor);
      formData.append('editorial', documentData.editorial || "");
      formData.append('año', documentData.año);
      formData.append('pais', documentData.pais);
      
      documentData.tomos.forEach((tomo, index) => {
        formData.append(`tomos[${index}][numero]`, String(tomo.numero));
        if (tomo.archivo) {
          formData.append(`tomos[${index}][archivo]`, tomo.archivo);
        }
      });

      const token = localStorage.getItem("token");
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bibliotecas`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        alert("Documento guardado exitosamente!");
        router.push('/dashboard/consultas');
      } else {
        setSaveError("Error inesperado al guardar el documento");
      }
    } catch (error: any) {
      console.error("Error al guardar:", error);

      if (error.response) {
        const serverError = error.response.data;
        
        // Manejo específico de errores de archivos
        if (serverError.message?.toLowerCase().includes("pdf") || 
            serverError.errors?.some((e: any) => 
              e.path?.toLowerCase().includes("archivo") || 
              e.message?.toLowerCase().includes("pdf"))) {
          
          // Mensaje detallado del servidor
          const serverMessage = serverError.message || 
            serverError.errors?.map((e: any) => e.message).join(", ") || 
            "El archivo debe ser un PDF válido";
          
          setSaveError(`Error en archivos: ${serverMessage}`);
        } 
        else if (serverError.errors) {
          // Manejar otros errores de validación
          const errors = serverError.errors;
          const firstError = Object.values(errors)[0] as string[];
          setSaveError(firstError[0] || "Error de validación");
        } else {
          setSaveError(serverError.message || "Error del servidor");
        }
      } else {
        setSaveError("Error de conexión con el servidor");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const canProceedToStep2 = documentData.type && documentData.denomination && documentData.consecutivo;
  const canProceedToStep3 = documentData.titulo && documentData.autor && documentData.año && documentData.pais;
  const canSave = documentData.tomos.every(tomo => tomo.archivo !== null && !tomo.error);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-full space-y-6">
      <Card>
        {saveError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{saveError}</span>
          </div>
        )}

        {step === 1 && (
          <CardContent className="space-y-6">
            <CardHeader className="px-0">
              <CardTitle>Paso 1: Tipo y Denominación del Documento</CardTitle>
              <CardDescription>
                Selecciona el tipo de documento y su denominación correspondiente
              </CardDescription>
            </CardHeader>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        step > stepNumber ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document-type">Tipo de Documento</Label>
                <Select
                  value={documentData.type}
                  onValueChange={(value: DocumentType) =>
                    setDocumentData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="libros">LIBROS</SelectItem><SelectItem value="libros_anillados">LIBROS ANILLADOS</SelectItem><SelectItem value="azs">AZS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="denomination">Denominación</Label>
                <Select
                  value={documentData.denomination}
                  onValueChange={handleDenominationChange}
                  disabled={!documentData.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la denominación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MI">MI - Memoria Institucional</SelectItem><SelectItem value="CG">CG - Colección General</SelectItem><SelectItem value="J">J - Jurídico</SelectItem><SelectItem value="R">R - Revistas</SelectItem><SelectItem value="H">H - Hemeroteca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {documentData.denomination && (
                <div className="space-y-2">
                  <Label htmlFor="consecutivo">Consecutivo</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-muted px-3 py-2 rounded-md border">
                      <span className="font-medium">{documentData.denomination}</span>
                    </div>
                    <Input
                      id="consecutivo"
                      value={documentData.consecutivo.replace(
                        documentData.denomination,
                        ""
                      )}
                      onChange={(e) => {
                        const numero = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setDocumentData((prev) => ({
                          ...prev,
                          consecutivo: `${documentData.denomination}${numero}`,
                        }));
                      }}
                      placeholder="1234"
                      maxLength={4}
                      className="w-24"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ingresa el número consecutivo (hasta 4 dígitos)
                  </p>
                  {documentData.consecutivo &&
                    documentData.consecutivo.length >
                      documentData.denomination.length && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Label className="text-sm font-medium text-blue-700">
                          Código Final:
                        </Label>
                        <Badge
                          variant="secondary"
                          className="ml-2 text-lg bg-blue-100 text-blue-800"
                        >
                          {documentData.consecutivo}
                        </Badge>
                      </div>
                    )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="flex items-center gap-2"
                >
                  Siguiente <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {step === 2 && (
          <CardContent className="space-y-6">
            <CardHeader className="px-0">
              <CardTitle>Paso 2: Información del Documento</CardTitle>
              <CardDescription>
                Completa los datos bibliográficos del documento
              </CardDescription>
            </CardHeader>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        step > stepNumber ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={documentData.titulo}
                  onChange={(e) =>
                    setDocumentData((prev) => ({
                      ...prev,
                      titulo: e.target.value,
                    }))
                  }
                  placeholder="Ingresa el título del documento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autor">Autor *</Label>
                <Input
                  id="autor"
                  value={documentData.autor}
                  onChange={(e) =>
                    setDocumentData((prev) => ({
                      ...prev,
                      autor: e.target.value,
                    }))
                  }
                  placeholder="Ingresa el autor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editorial">Editorial</Label>
                <Input
                  id="editorial"
                  value={documentData.editorial}
                  onChange={(e) =>
                    setDocumentData((prev) => ({
                      ...prev,
                      editorial: e.target.value,
                    }))
                  }
                  placeholder="Editorial (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="año">Año *</Label>
                <Select
                  value={documentData.año}
                  onValueChange={(value) => setDocumentData(prev => ({ ...prev, año: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un año" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {years.map(year => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <Select
                  value={documentData.pais}
                  onValueChange={(value) => setDocumentData((prev) => ({ ...prev, pais: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {paises.paises_latinoamerica.map((pais: { id: number; nombre: string }) => (
                      <SelectItem key={pais.id} value={pais.nombre}>
                        {pais.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-full space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Tomos</Label>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleAddTomo}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Agregar tomo
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentData.tomos.map((tomo, index) => (
                    <div key={index} className="border rounded-lg p-4 flex flex-col gap-3 relative">
                      {documentData.tomos.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveTomo(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <div className="space-y-2">
                        <Label>Número de Tomo</Label>
                        <div className="flex items-center bg-muted px-3 py-2 rounded-md border">
                          <span className="font-medium">{tomo.numero}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                className="flex items-center gap-2"
              >
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}

        {step === 3 && (
          <CardContent className="space-y-6">
            <CardHeader className="px-0">
              <CardTitle>Paso 3: Carga de Documento</CardTitle>
              <CardDescription>
                Sube los archivos PDF digitalizados para cada tomo
              </CardDescription>
            </CardHeader>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        step > stepNumber ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="font-medium">Resumen del Documento:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Código:</strong> {documentData.consecutivo}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {documentData.type}
                  </div>
                  <div>
                    <strong>Título:</strong> {documentData.titulo}
                  </div>
                  <div>
                    <strong>Autor:</strong> {documentData.autor}
                  </div>
                  <div>
                    <strong>Año:</strong> {documentData.año}
                  </div>
                  <div>
                    <strong>País:</strong> {documentData.pais}
                  </div>
                  <div>
                    <strong>Tomos:</strong> {documentData.tomos.map(t => t.numero).join(', ')}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {documentData.tomos.map((tomo, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="font-medium text-lg">
                        Tomo: {tomo.numero}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sube el archivo PDF correspondiente a este tomo
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`archivo-${index}`}>Archivo PDF *</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Arrastra y suelta tu archivo PDF aquí, o
                          </p>
                          <Input
                            id={`archivo-${index}`}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleTomoFileChange(
                              index, 
                              e.target.files?.[0] || null
                            )}
                            className="max-w-xs mx-auto"
                          />
                        </div>
                        {tomo.archivo && (
                          <div className="mt-4 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm text-green-700">
                              ✓ Archivo seleccionado: {tomo.archivo.name}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Tamaño: {(tomo.archivo.size / 1024 / 1024).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        )}
                        {tomo.error && (
                          <p className="text-red-500 text-sm mt-4">
                            <FileWarning className="inline mr-1 h-4 w-4" />
                            {tomo.error}
                          </p>
                        )}
                        {!tomo.archivo && !tomo.error && (
                          <p className="text-red-500 text-sm mt-4">
                            <FileWarning className="inline mr-1 h-4 w-4" />
                            Por favor selecciona un archivo PDF para este tomo
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Anterior
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar Documento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}