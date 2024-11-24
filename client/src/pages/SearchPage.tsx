'use client'

import { useState, useEffect } from "react"
import { useDebounce } from "use-debounce"
import { Loader, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Layout from "@/components/Layout"
import { Link } from "react-router-dom"

interface Employee {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  totalPerformance: number
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const searchEmployees = async (term: string) => {
    if (!term) {
      setEmployees([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/hr/search?query=${encodeURIComponent(term)}`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      } else {
        console.error("Failed to fetch employees")
      }
    } catch (error) {
      console.error("Error searching employees:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchEmployees(debouncedSearchTerm)
    } else {
      setEmployees([]) // Clear employees if search term is empty
    }
  }, [debouncedSearchTerm]); // Correctly set the dependency array here

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Employee Search</h1>
        <h2 className="text-lg text-muted-foreground">Find and manage employee records efficiently.</h2>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={() => searchEmployees(searchTerm)}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        {searchTerm.length === 0 && <p className="text-sm text-center font-semibold text-muted-foreground">Type a employee name, email or ID in the search bar</p>}
        {isLoading ? (
          <div className="flex justify-center">
            <Loader className="size-6 animate-spin" />
          </div>
        ) : employees.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${employee.firstName} ${employee.lastName}`} />
                        <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <Link to={`/employee/${employee._id}`}>{employee.firstName} {employee.lastName}</Link>
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.totalPerformance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : searchTerm && !isLoading ? (
          <p className="text-center text-muted-foreground">No employees found</p>
        ) : null}
      </div>
    </Layout>
  )
}
