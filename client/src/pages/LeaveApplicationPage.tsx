"use client";

import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/userContext";
import Layout from "@/components/Layout";

interface LeaveApplicationData {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// Define the types for leave application data
interface LeaveApplicationStatus {
  approvedLeaves: number;
  pendingLeaves: number;
  rejectedLeaves: number;
  totalLeavesForTheMonth: number;
  message: string;
  appliedLeaves: string;
}

const leaveTypes = [
  "Annual Leave",
  "Sick Leave",
  "Personal Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Unpaid Leave",
];

export default function LeaveApplication() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LeaveApplicationData>({
    employeeId: user?.id || "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [leaveStatus, setLeaveStatus] = useState<LeaveApplicationStatus | null>(
    null
  );
  const [isStatusLoading, setIsStatusLoading] = useState<boolean>(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaveStatus = async () => {
      try {
        const response = await fetch("/api/employee/leave-application-status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch leave application status."
          );
        }

        const data: LeaveApplicationStatus = await response.json();
        setLeaveStatus(data);
      } catch (err: any) {
        console.error("Error fetching leave status:", err.message);
        setStatusError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsStatusLoading(false);
      }
    };

    fetchLeaveStatus();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, leaveType: value }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/employee/apply-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: "Failed to apply a leave!",
          description: data.message,
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: "Leave application submitted successfully",
      });

      navigate("/all-leaves");
    } catch (error) {
      console.error("Error submitting leave application:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10 flex flex-col">
        <h2 className="text-center font-semibold text-3xl">Apply A Leave</h2>
        {isStatusLoading ? (
          <Loader className="size-8 animate-spin" />
        ) : (
          leaveStatus && (
            <div className="flex items-center justify-between my-4">
              <Card className="w-[200px] text-center">
                <CardHeader className="rounded-t-md text-white text-xl bg-gradient-to-tl from-blue-400 to-blue-600">
                  <CardTitle>Applied Leaves</CardTitle>
                </CardHeader>
                <CardContent><span className="text-2xl">{leaveStatus.appliedLeaves}</span></CardContent>
              </Card>
              <Card className="w-[200px] text-center">
                <CardHeader className="rounded-t-md text-white text-xl bg-gradient-to-tl from-blue-400 to-blue-600">
                  <CardTitle>Approved Leaves</CardTitle>
                </CardHeader>
                <CardContent><span className="text-2xl">{leaveStatus.approvedLeaves}</span></CardContent>
              </Card>
              <Card className="w-[200px] text-center">
                <CardHeader className="rounded-t-md text-white text-xl bg-gradient-to-tl from-blue-400 to-blue-600">
                  <CardTitle>Pending Leaves</CardTitle>
                </CardHeader>
                <CardContent><span className="text-2xl">{leaveStatus.pendingLeaves}</span></CardContent>
              </Card>
              <Card className="w-[200px] text-center">
                <CardHeader className="rounded-t-md text-white text-xl bg-gradient-to-tl from-blue-400 to-blue-600">
                  <CardTitle>Rejected Leaves</CardTitle>
                </CardHeader>
                <CardContent><span className="text-2xl">{leaveStatus.rejectedLeaves}</span></CardContent>
              </Card>
            </div>
          )
        )}
        {leaveStatus?.appliedLeaves === "4" ? (
          <div className="size-full">
            <p className="text-center text-xl font-semibold text-muted-foreground">You exeeds monthly leave applications</p>
          </div>
        ): (
          <Card>
          <CardHeader>
            <CardTitle>Leave Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  onValueChange={handleSelectChange}
                  value={formData.leaveType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm font-semibold text-muted-foreground">{leaveStatus?.message}</p>
          </CardFooter>
        </Card>
        )}
      </div>
    </Layout>
  );
}
