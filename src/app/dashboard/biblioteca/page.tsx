"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DocumentType = "libro" | "libro-anillado" | "azs" | ""
type Denomination = "MI" | "CG" | "J" | "R" | "H" | ""

interface DocumentData {
  type: DocumentType
  denomination: Denomination
  consecutivo: string
  titulo: string
  autor: string
  editorial: string
  tomo: string
  año: string
  pais: string
  archivo: File | null
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
    tomo: "",
    año: "",
    pais: "",
    archivo: null,
  })

  const handleDenominationChange = (value: Denomination) => {
    setDocumentData((prev) => ({
      ...prev,
      denomination: value,
      consecutivo: "", // Limpiar el consecutivo cuando cambie la denominación
    }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setDocumentData((prev) => ({ ...prev, archivo: file }))
  }

  const handleSave = async () => {
    if (!documentData.archivo) {
      setSaveError("Por favor selecciona un archivo PDF");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('tipo_documento', documentData.type);
      formData.append('denominacion', documentData.denomination);
      formData.append('denominacion_numerica', documentData.consecutivo);
      formData.append('titulo', documentData.titulo);
      formData.append('autor', documentData.autor);
      formData.append('editorial', documentData.editorial || "");
      formData.append('tomo', documentData.tomo || "");
      formData.append('año', documentData.año);  // Enviar como string
      formData.append('pais', documentData.pais);
      formData.append('archivo', documentData.archivo);  // Nombre correcto

      // Enviar datos a la API de Laravel
      const token = localStorage.getItem("token")
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bibliotecas`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        // Éxito: mostrar mensaje y redirigir
        alert("Documento guardado exitosamente!");
        router.push('/consultas');
      } else {
        setSaveError("Error inesperado al guardar el documento");
      }
    } catch (error: any) {
      console.error("Error al guardar:", error);

      if (error.response) {
        // Error de validación del servidor
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          const firstError = Object.values(errors)[0] as string[];
          setSaveError(firstError[0] || "Error de validación");
        } else {
          setSaveError(error.response.data.message || "Error del servidor");
        }
      } else {
        setSaveError("Error de conexión con el servidor");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const canProceedToStep2 = documentData.type && documentData.denomination && documentData.consecutivo
  const canProceedToStep3 = documentData.titulo && documentData.autor && documentData.año && documentData.pais
  const canSave = documentData.archivo

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registro de Documentos</h1>
        <p className="text-muted-foreground">Sistema de catalogación y digitalización de documentos</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 3 && <div className={`w-12 h-0.5 mx-2 ${step > stepNumber ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Mensaje de error */}
      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{saveError}</span>
        </div>
      )}

      {/* Step 1: Document Type and Denomination */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Tipo y Denominación del Documento</CardTitle>
            <CardDescription>Selecciona el tipo de documento y su denominación correspondiente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select
                value={documentData.type}
                onValueChange={(value: DocumentType) => setDocumentData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="libro">Libro</SelectItem>
                  <SelectItem value="libro-anillado">Libro Anillado</SelectItem>
                  <SelectItem value="azs">AZS</SelectItem>
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
                  <SelectItem value="MI">MI - Memoria Institucional</SelectItem>
                  <SelectItem value="CG">CG - Colección General</SelectItem>
                  <SelectItem value="J">J - Jurídico</SelectItem>
                  <SelectItem value="R">R - Revistas</SelectItem>
                  <SelectItem value="H">H - Hemeroteca</SelectItem>
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
                    value={documentData.consecutivo.replace(documentData.denomination, "")}
                    onChange={(e) => {
                      const numero = e.target.value.replace(/\D/g, "").slice(0, 4)
                      setDocumentData((prev) => ({
                        ...prev,
                        consecutivo: `${documentData.denomination}${numero}`,
                      }))
                    }}
                    placeholder="1234"
                    maxLength={4}
                    className="w-24"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Ingresa el número consecutivo (hasta 4 dígitos)</p>
                {documentData.consecutivo && documentData.consecutivo.length > documentData.denomination.length && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-blue-700">Código Final:</Label>
                    <Badge variant="secondary" className="ml-2 text-lg bg-blue-100 text-blue-800">
                      {documentData.consecutivo}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canProceedToStep2} className="flex items-center gap-2">
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Document Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 2: Información del Documento</CardTitle>
            <CardDescription>Completa los datos bibliográficos del documento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={documentData.titulo}
                  onChange={(e) => setDocumentData((prev) => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ingresa el título del documento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autor">Autor *</Label>
                <Input
                  id="autor"
                  value={documentData.autor}
                  onChange={(e) => setDocumentData((prev) => ({ ...prev, autor: e.target.value }))}
                  placeholder="Ingresa el autor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editorial">Editorial</Label>
                <Input
                  id="editorial"
                  value={documentData.editorial}
                  onChange={(e) => setDocumentData((prev) => ({ ...prev, editorial: e.target.value }))}
                  placeholder="Editorial (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tomo">Tomo</Label>
                <Input
                  id="tomo"
                  value={documentData.tomo}
                  onChange={(e) => setDocumentData((prev) => ({ ...prev, tomo: e.target.value }))}
                  placeholder="Número de tomo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="año">Año *</Label>
                <Input
                  id="año"
                  type="number"
                  value={documentData.año}
                  onChange={(e) => setDocumentData((prev) => ({ ...prev, año: e.target.value }))}
                  placeholder="Año de publicación"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País *</Label>
                <Input
                  id="pais"
                  value={documentData.pais}
                  onChange={(e) => setDocumentData((prev) => ({ ...prev, pais: e.target.value }))}
                  placeholder="País de publicación"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedToStep3} className="flex items-center gap-2">
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: File Upload */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 3: Carga de Documento</CardTitle>
            <CardDescription>Sube el archivo PDF digitalizado del documento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Summary */}
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
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo PDF *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Arrastra y suelta tu archivo PDF aquí, o</p>
                  <Input
                    id="archivo"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="max-w-xs mx-auto"
                  />
                </div>
                {documentData.archivo && (
                  <div className="mt-4 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-700">✓ Archivo seleccionado: {documentData.archivo.name}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Tamaño: {(documentData.archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="flex items-center gap-2">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}