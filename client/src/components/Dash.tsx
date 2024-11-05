import { useState, useEffect } from "react"
import { Loader, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Link } from "react-router-dom"

interface Employee {
  _id: string
  firstName: string
  lastName: string
  email: string
  totalPerformance: number
  performance: { month: string; performance: number }[]
}

interface EmployeeData {
  totalEmployees: number
  employees: Employee[]
}

const maxMonthlyScore = 200

export default function EmployeeDashboard() {
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const getEmployeeData = async () => {
      try {
        const res = await fetch("/api/hr/employees")
        const data = await res.json()
        if (res.ok) {
          setEmployeeData(data)
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getEmployeeData()
  }, [])

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!employeeData) {
    return <div>Failed to load employee data.</div>
  }

  // Sort employees by performance percentage
  const topEmployees = employeeData.employees
    .map(employee => {
      const maxPossiblePerformance = employee.performance.length * maxMonthlyScore
      const performancePercentage = (employee.totalPerformance / maxPossiblePerformance) * 100
      return { ...employee, performancePercentage }
    })
    .sort((a, b) => b.performancePercentage - a.performancePercentage)
    .slice(0, 5)

  return (
    <div className="h-full w-full flex flex-col gap-6 p-6">
      <Card className="w-[300px]">
        <CardHeader className="rounded-t-sm bg-gradient-to-br from-blue-400 to-blue-600">
          <CardTitle className="text-white text-center">Total Employees</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-3xl font-bold text-center">{employeeData.totalEmployees}</p>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl">Top Performing Employees</CardTitle>
        </CardHeader>
        <CardContent className="border-t">
          <ul className="space-y-6">
            {topEmployees.map((employee, index) => {
              const positionLabel = index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : null;

              return (
                <Link to={`/employee/${employee._id}`} key={employee._id}>
                  <li className="px-2 py-4 shadow-md rounded-md flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${employee.firstName} ${employee.lastName}`} />
                      <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{employee.firstName} {employee.lastName}</p>
                        {positionLabel && (
                          <span className="text-xs font-semibold text-white bg-blue-500 px-2 py-0.5 rounded">
                            {positionLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <Progress value={employee.performancePercentage} className="h-2" />
                    </div>
                    <div className="text-sm font-medium">{employee.totalPerformance}</div>
                  </li>
                </Link>
              )
            })}
          </ul>
        </CardContent>
        <CardFooter>
          <Link to="/employees" className="mx-auto flex items-center gap-2 hover:text-blue-600 transition-transform font-semibold">
            <span>View All Employees</span> <ArrowRight/>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
