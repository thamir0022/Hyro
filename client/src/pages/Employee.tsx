import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HRFeedbacks from "@/components/HRFeedbacks";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Performance {
  _id: string;
  month: string;
  performance: number;
}

interface EmployeeData {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  position: string;
  joiningDate: string;
  performance: Performance[];
  totalPerformance: number;
  createdAt: Date;
}

interface CTCData {
  annualCTC: number;
  monthlyInHand: number;
  effectiveDate: string;
  otherComponents: {
    allowances: {
      housingAllowance: number;
      transportAllowance: number;
      mealAllowance: number;
    };
    bonuses: {
      performanceBonus: number;
      yearEndBonus: number;
    };
    deductions: {
      tax: number;
      healthInsurance: number;
      providentFund: number;
    };
  };
}

interface AttendanceData {
  attendanceData: {
    _id: string;
    userId: string;
    checkInTime: string;
    checkOutTime: string;
    date: string;
    duration: number;
  }[];
  workedHours: number;
  totalWorkingHours: number;
}

interface perfomanceData {
  monthlyPerfomance: {
    month: string;
    performance: string;
  }[];
  totalPerformance: string;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function CTCDetails({ ctcData }: { ctcData: CTCData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compensation Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">
              Annual CTC: ₹{ctcData.annualCTC.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Monthly In-Hand: ₹{ctcData.monthlyInHand.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Effective Date:{" "}
              {new Date(ctcData.effectiveDate).toLocaleDateString()}
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="allowances">
              <AccordionTrigger>Allowances</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside">
                  <li>
                    Housing: ₹
                    {ctcData?.otherComponents?.allowances.housingAllowance.toLocaleString()}
                  </li>
                  <li>
                    Transport: ₹
                    {ctcData?.otherComponents?.allowances.transportAllowance.toLocaleString()}
                  </li>
                  <li>
                    Meal: ₹
                    {ctcData?.otherComponents?.allowances.mealAllowance.toLocaleString()}
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="bonuses">
              <AccordionTrigger>Bonuses</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside">
                  <li>
                    Performance Bonus: ₹
                    {ctcData.otherComponents?.bonuses.performanceBonus.toLocaleString()}
                  </li>
                  <li>
                    Year-End Bonus: ₹
                    {ctcData.otherComponents?.bonuses.yearEndBonus.toLocaleString()}
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="deductions">
              <AccordionTrigger>Deductions</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside">
                  <li>
                    Tax: ₹
                    {ctcData.otherComponents?.deductions.tax.toLocaleString()}
                  </li>
                  <li>
                    Health Insurance: ₹
                    {ctcData.otherComponents?.deductions.healthInsurance.toLocaleString()}
                  </li>
                  <li>
                    Provident Fund: ₹
                    {ctcData.otherComponents?.deductions.providentFund.toLocaleString()}
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Employee() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [ctcData, setCTCData] = useState<CTCData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  const [perfomanceData, setPerfomanceData] = useState<perfomanceData | null>(
    null
  );
  const [attendancePeriod, setAttendancePeriod] = useState<string>("weekly");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newPerfomance, setNewPerformance] = useState({
    year: new Date().getFullYear().toString(),
    month: months[new Date().getMonth()],
    performance: "",
  });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeeRes, ctcRes, attendanceRes, perfomanceRes] =
          await Promise.all([
            fetch(`/api/hr/employee/${id}`),
            fetch(`/api/employee/ctc/${id}`),
            fetch(
              `/api/hr/employee-attendance?userId=${id}&period=${attendancePeriod}`
            ),
            fetch(`/api/hr/get-perfomance/${id}`),
            fetch("/api/employee/get-my-performance")
          ]);

        if (!employeeRes.ok) throw new Error("Failed to fetch employee data");
        if (!ctcRes.ok) throw new Error("Failed to fetch CTC data");
        if (!attendanceRes.ok)
          throw new Error("Failed to fetch attendance data");
        if (!perfomanceRes.ok)
          throw new Error("Failed to fetch perfomance data");

        const employeeData = await employeeRes.json();
        const ctcData = await ctcRes.json();
        const attendanceData = await attendanceRes.json();
        const perfomanceData = await perfomanceRes.json();

        setEmployee(employeeData);
        setCTCData(ctcData.ctc);
        setAttendanceData(attendanceData);
        setPerfomanceData(perfomanceData.employeePerfomance);
      } catch (error: any) {
        console.error(error.message);
        toast({
          title: "Failed to load employee data.",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, attendancePeriod]);

  if (!employee) {
    return <div>Failed to load employee data.</div>;
  }

  const chartData = employee.performance.map((p) => ({
    month: p.month,
    Performance: p.performance,
  }));

  const chartConfig = {
    Performance: {
      label: "Performance",
      color: "hsl(var(--chart-1))",
    },
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/hr/delete-employee/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      // Handle unsuccessful response
      if (!response.ok) {
        toast({
          title: data.message || "An error occurred.",
          variant: "destructive",
        });
        return;
      }

      // Handle successful response
      toast({
        title: data.message || "Employee deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Delete request failed:", error);
      toast({
        title: "Failed to delete employee.",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }
  };

  const handleAddNewPerformance = async () => {
    try {
      if (
        Number(newPerfomance.performance) <= 0 ||
        Number(newPerfomance.performance) > 200
      ) {
        throw new Error(
          `Performance score should be between 1 and 200 ${newPerfomance.performance} is not valid`
        );
      }

      if (!newPerfomance.year || !newPerfomance.month) {
        throw new Error("Year and month are required!");
      }

      const res = await fetch(`/api/hr/add-perfomance/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ ...newPerfomance}),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Failed to add new performance",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Perfomance Added Successfully",
        description: data.message,
      });

      setOpenDialog(false);
    } catch (error: any) {
      toast({
        title: "Error on adding new performance",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="size-full flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="container mx-auto p-6 space-y-6">
          <h2 className="mb-4 text-center text-3xl font-semibold">
            Employee Details
          </h2>
          <Card>
            <CardHeader></CardHeader>
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
                  {(
                    ((employee.totalPerformance || 0) /
                      (200 * (employee.performance?.length || 0))) *
                      100 || 0
                  ).toFixed(2)}{" "}
                  %
                </p>

                <p className="font-semibold">
                  Joined On{" "}
                  {employee.joiningDate
                    ? new Date(employee.joiningDate).toDateString()
                    : new Date(employee.createdAt).toDateString()}
                </p>
              </div>
              <div className="flex ml-auto gap-3">
                <Link to={`/employee/edit/${employee._id}`} className="ml-auto">
                  <Button>Edit</Button>
                </Link>
                <Dialog>
                  <DialogTrigger>
                    <Button variant={"destructive"}>Delete</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-center">
                        Are you sure, you want to delete{" "}
                        <span className="font-semibold capitalize">
                          {employee.firstName} {employee.lastName}
                        </span>
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      <p className="text-center px-2 py-4">
                        This action cannot be undone. This will permanently
                        delete the account and remove the data from our servers.
                      </p>
                      <div className="flex justify-evenly">
                        <DialogClose>
                          <Button>Cancel</Button>
                        </DialogClose>
                        <Button
                          onClick={() => handleDelete()}
                          variant={"destructive"}
                        >
                          Delete
                        </Button>
                      </div>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {ctcData && <CTCDetails ctcData={ctcData} />}

          {/* Attendance Details Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Attendance Details</CardTitle>
              <Select
                value={attendancePeriod}
                onValueChange={setAttendancePeriod}
              >
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
                    <span className="font-semibold">
                      {attendanceData.workedHours.toFixed(2)} hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Working Hours:</span>
                    <span className="font-semibold">
                      {attendanceData.totalWorkingHours} hours
                    </span>
                  </div>
                  <Progress
                    value={
                      (attendanceData.workedHours /
                        attendanceData.totalWorkingHours) *
                      100
                    }
                    className="w-full h-2"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {(
                      (attendanceData.workedHours /
                        attendanceData.totalWorkingHours) *
                      100
                    ).toFixed(2)}
                    % of expected hours
                  </p>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="attendance-details">
                      <AccordionTrigger>
                        View Detailed Attendance
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {attendanceData.attendanceData.map((record) => (
                            <li
                              key={record._id}
                              className="flex justify-between items-center"
                            >
                              <span>
                                {new Date(record.date).toLocaleDateString()}
                              </span>
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

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        const [month, year] = value.split(" ");
                        return `${month.slice(0, 3)} ${year}`;
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="Performance"
                      type="natural"
                      // fill=""
                      fillOpacity={0.4}
                      // stroke=""
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="max-h-[400px] overflow-y-scroll scroll-smooth cursor-pointer custom-scrollbar">
              <CardHeader className="sticky top-0 bg-white">
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {perfomanceData?.monthlyPerfomance.map((p) => (
                  <div
                    className="w-full flex justify-between py-1 px-3"
                    key={p.month}
                  >
                    <p className="font-semibold">{p.month}</p>
                    <Badge>{p.performance}</Badge>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button onClick={() => setOpenDialog(true)}>
                  <Plus />
                  Add New Perfomance
                </Button>
              </CardFooter>
            </Card>
          </div>

          <HRFeedbacks
            user={{
              id: id as string,
              name: `${employee.firstName} ${employee.lastName}`,
            }}
          />
        </div>
      )}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-center border-b pb-2">
              New Perfomance
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 items-center">
            {/* Year Dropdown - Only This Year & Next Year */}
            <label className="text-xl font-semibold" htmlFor="year">
              Year
            </label>
            <Select
              defaultValue={newPerfomance.year}
              onValueChange={(value) =>
                setNewPerformance((prev) => ({
                  ...prev,
                  year: value,
                }))
              }
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select A Year" />
              </SelectTrigger>
              <SelectContent id="year">
                <SelectGroup>
                  {[
                    new Date().getFullYear() - 1,
                    new Date().getFullYear(),
                    new Date().getFullYear() + 1,
                  ].map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <label className="text-xl font-semibold" htmlFor="year">
              Month
            </label>
            <Select
              onValueChange={(value) =>
                setNewPerformance((prev) => ({
                  ...prev,
                  month: value,
                }))
              }
              defaultValue={newPerfomance.month}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select A Month" />
              </SelectTrigger>
              <SelectContent id="year">
                <SelectGroup>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <label className="text-xl font-semibold" htmlFor="perfomance">
              Perfomance Score
            </label>
            <div className="space-y-1">
              <Input
                id="performance"
                placeholder="Eg: 150"
                value={newPerfomance.performance}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewPerformance((prev) => ({
                    ...prev,
                    [e.target.id]: e.target.value,
                  }))
                }
                required
              />
              <span className="text-xs text-muted-foreground font-semibold">
                Maximum Performane Score is 200
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => handleAddNewPerformance()}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
