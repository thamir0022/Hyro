import { useEffect, useState } from "react"
import { Loader } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, YAxis } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useUser } from "@/context/userContext"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import Feedback from "@/components/Feedback"

interface Performance {
  _id: string
  month: string
  performance: number
}

interface EmployeeData {
  _id: string
  firstName: string
  lastName: string
  role: string
  position: string
  email: string
  performance: Performance[]
  totalPerformance: number
  createdAt: Date
}

interface CTCData {
  annualCTC: number
  monthlyInHand: number
  effectiveDate: string
  otherComponents: {
    allowances: {
      housingAllowance: number
      transportAllowance: number
      mealAllowance: number
    }
    bonuses: {
      performanceBonus: number
      yearEndBonus: number
    }
    deductions: {
      tax: number
      healthInsurance: number
      providentFund: number
    }
  }
}


interface AttendanceData {
  attendanceData: {
    _id: string
    userId: string
    checkInTime: string
    checkOutTime: string
    date: string
    duration: number
  }[]
  workedHours: number
  totalWorkingHours: number
}

function CTCDetails({ ctcData }: { ctcData: CTCData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Compensation Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Annual CTC: ₹{ctcData.annualCTC.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Monthly In-Hand: ₹{ctcData.monthlyInHand.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Effective Date: {new Date(ctcData.effectiveDate).toLocaleDateString()}</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="allowances">
              <AccordionTrigger>Allowances</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside">
                  <li>Housing: ₹{ctcData.otherComponents.allowances.housingAllowance.toLocaleString()}</li>
                  <li>Transport: ₹{ctcData.otherComponents.allowances.transportAllowance.toLocaleString()}</li>
                  <li>Meal: ₹{ctcData.otherComponents.allowances.mealAllowance.toLocaleString()}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="bonuses">
              <AccordionTrigger>Bonuses</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside">
                  <li>Performance Bonus: ₹{ctcData.otherComponents.bonuses.performanceBonus.toLocaleString()}</li>
                  <li>Year-End Bonus: ₹{ctcData.otherComponents.bonuses.yearEndBonus.toLocaleString()}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="deductions">
              <AccordionTrigger>Deductions</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside">
                  <li>Tax: ₹{ctcData.otherComponents.deductions.tax.toLocaleString()}</li>
                  <li>Health Insurance: ₹{ctcData.otherComponents.deductions.healthInsurance.toLocaleString()}</li>
                  <li>Provident Fund: ₹{ctcData.otherComponents.deductions.providentFund.toLocaleString()}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Employee() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [ctcData, setCTCData] = useState<CTCData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [attendancePeriod, setAttendancePeriod] = useState<string>('weekly')
  const { user } = useUser()
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeeRes, ctcRes, attendanceRes, feedbacksRes] = await Promise.all([
          fetch(`/api/employee/user/${user?.id}`),
          fetch(`/api/employee/ctc/${user?.id}`),
          fetch(`/api/employee/attendance?userId=${user?.id}&period=${attendancePeriod}`),
          fetch("/api/employee/feedbacks"),
        ]);
  
        const employeeData = await employeeRes.json();
        const ctcData = await ctcRes.json();
        const attendanceData = await attendanceRes.json();
        const feedbacksData = await feedbacksRes.json();
  
        // If any of the responses are not ok, use the message from the response
        if (!employeeRes.ok) throw new Error(employeeData?.message || "Failed to fetch employee data");
        if (!ctcRes.ok) throw new Error(ctcData?.message || "Failed to fetch CTC data");
        if (!attendanceRes.ok) throw new Error(attendanceData?.message || "Failed to fetch attendance data");
        if (!feedbacksRes.ok) throw new Error(feedbacksData?.message || "Failed to fetch feedback data");
  
        setEmployee(employeeData);
        setCTCData(ctcData.ctc);
        setAttendanceData(attendanceData);
        setFeedbacks(feedbacksData);
      } catch (error: any) {
        console.error(error.message);
        toast({
          title: "Error",
          description: error.message || "Failed to load employee data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [user?.id, attendancePeriod]);
  

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true)
      const res = await fetch("/api/employee/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Check-in failed")
      alert("Check-in successful!")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true)
      const res = await fetch("/api/employee/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Check-out failed")
      alert("Check-out successful!")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!employee) {
    return <div>Failed to load employee data.</div>
  }

  const chartData = employee.performance.map((p) => ({
    month: p.month,
    Performance: p.performance,
  }))

  const chartConfig = {
    Performance: {
      label: "Performance",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-semibold text-center">My Profile</h2>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${employee.firstName} ${employee.lastName}`}
            />
            <AvatarFallback>
              {employee.firstName[0]}
              {employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="font-semibold">{employee.position}</p>
            <p className="text-muted-foreground">{employee.email}</p>
            <p className="font-semibold">
              Total Performance Score: {employee.totalPerformance} /{" "}
              {200 * employee.performance.length}
            </p>
            <p className="font-semibold">
              Performance Percentage:{" "}
              {((employee.totalPerformance / (200 * employee.performance.length)) * 100).toFixed(2)} %
            </p>
            <p className="font-semibold">
              Joined On: {employee.createdAt ? new Date(employee.createdAt).toDateString() : "January 2 Tuesday 2024"}
            </p>
          </div>
          <div className="ml-auto flex gap-4">
            <Button onClick={handleCheckIn} disabled={isCheckingIn}>
              {isCheckingIn ? "Checking In..." : "Check In"}
            </Button>
            <Button onClick={handleCheckOut} disabled={isCheckingOut}>
              {isCheckingOut ? "Checking Out..." : "Check Out"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {ctcData && <CTCDetails ctcData={ctcData} />}

      {/* Attendance Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>My Attendance Details</CardTitle>
          <Select value={attendancePeriod} onValueChange={setAttendancePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {attendanceData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Hours Worked:</span>
                <span className="font-semibold">{attendanceData.workedHours.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Working Hours:</span>
                <span className="font-semibold">{attendanceData.totalWorkingHours} hours</span>
              </div>
              <Progress 
                value={(attendanceData.workedHours / attendanceData.totalWorkingHours) * 100} 
                className="w-full h-2"
              />
              <p className="text-sm text-muted-foreground text-right">
                {((attendanceData.workedHours / attendanceData.totalWorkingHours) * 100).toFixed(2)}% of expected hours
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="attendance-details">
                  <AccordionTrigger>View Detailed Attendance</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {attendanceData.attendanceData.map((record) => (
                        <li key={record._id} className="flex justify-between items-center">
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                          <span>{record.duration?.toFixed(2)} hours</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ) : (
            <p>No attendance data available.</p>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>My Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              className="h-72 mt-4"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={(value) => value.slice(0, 3)} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="Performance" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Feedback feedbacks={feedbacks}/>
    </div>
  )
}