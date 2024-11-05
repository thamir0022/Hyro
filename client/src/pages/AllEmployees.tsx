// Other imports remain unchanged
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  totalPerformance: number;
  createdAt?: string;
}

interface EmployeeData {
  totalEmployees: number;
  employees: Employee[];
}

type SortKey = "name" | "role" | "email" | "totalPerformance" | "createdAt";

export default function AllEmployees() {
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("totalPerformance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/hr/employees");
        if (response.ok) {
          const data: EmployeeData = await response.json();
          setEmployeeData(data);
        } else {
          console.error("Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const sortEmployees = (employees: Employee[]): Employee[] => {
    return [...employees].sort((a, b) => {
      if (sortKey === "name") {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (sortKey === "createdAt") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return sortOrder === "asc"
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Check if employeeData is not null before sorting
  const sortedEmployees = employeeData ? sortEmployees(employeeData.employees) : [];

  return (
    <Layout>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      ) : !employeeData ? ( // Adjusted condition for null employeeData
        <div className="flex justify-center items-center h-screen">
          <p>No employee data</p>
        </div>
      ) : ( // Render employee data if employeeData is not null
        <div className="container mx-auto py-10">
          <h1 className="text-2xl font-bold mb-4">
            Total Employees {employeeData.totalEmployees}
          </h1>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button variant="ghost" onClick={() => handleSort("name")}>
                      Name{" "}
                      {sortKey === "name" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("role")}>
                      Role{" "}
                      {sortKey === "role" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("email")}>
                      Email{" "}
                      {sortKey === "email" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalPerformance")}
                    >
                      Performance{" "}
                      {sortKey === "totalPerformance" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                    >
                      Join Date{" "}
                      {sortKey === "createdAt" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/6.x/initials/svg?seed=${employee.firstName} ${employee.lastName}`}
                          />
                          <AvatarFallback>
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Link to={`/employee/${employee._id}`}>
                          {employee.firstName} {employee.lastName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell className="text-right">
                      {employee.totalPerformance}
                    </TableCell>
                    <TableCell className="text-right">
                      {employee.createdAt
                        ? new Date(employee.createdAt).toDateString()
                        : "Tuesday January 2 2024"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Layout>
  );
}
