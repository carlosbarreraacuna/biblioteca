'use client'

import React, { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/app/dashboard/layout"
// import { CreateUsuario } from "@/app/usuarios/create/page"
// import { Breadcrumb } from "@/app/componentes/breadcrumb"
// import { EditUsuario } from "./edit/page"

type User = {
  id: number
  username: string
  email: string
  is_admin: boolean
  estado: boolean
}

type UsersResponse = {
  data: {
    data: User[]
  }
  current_page: number
  last_page: number
  prev_page_url: string | null
  next_page_url: string | null
}

const Users = () => {
  const [users, setUsers] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshFlag, setRefreshFlag] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/usuarios`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setUsers(response.data)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [currentPage, refreshFlag])

  const handleRefresh = () => setRefreshFlag((prev) => !prev)

  const filteredUsers = users?.data?.data
    ? users.data.data.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Usuarios</h2>
            {/* <Breadcrumb /> */}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <div>
              {/* <CreateUsuario onSuccess={handleRefresh} /> */}
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <Input
            placeholder="Buscar por usuario o correo..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-red-500">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_admin ? "default" : "destructive"}>
                        {user.is_admin ? "Sí" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.estado ? "default" : "destructive"}>
                        {user.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* <EditUsuario userId={user.id.toString()} onSuccess={handleRefresh} /> */}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {users?.current_page} de {users?.last_page}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!users?.prev_page_url}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ⟨ Anterior
            </Button>
            <Button
              variant="outline"
              disabled={!users?.next_page_url}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente ⟩
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Users
