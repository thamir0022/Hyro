import { useState, useEffect, ChangeEvent } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  totalPerformance: number;
  createdAt: string;
  updatedAt: string;
  joiningDate: string;
  position: string;
}

interface LeaveApplication {
  _id: string;
  employeeId: Employee;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  submissionDate: string;
  hrComments?: string;
}

type SortKey = "submissionDate" | "startDate" | "totalDays" | "status";

export default function HRLeaveApplications() {
  const [leaveApplications, setLeaveApplications] = useState<
    LeaveApplication[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("submissionDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [remainingCharacters, setRemainingCharacters] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      try {
        const response = await fetch("/api/hr/leave-applications");
        if (!response.ok) {
          throw new Error("Failed to fetch leave applications");
        }
        const data = await response.json();
        setLeaveApplications(data);
      } catch (error) {
        console.error("Error fetching leave applications:", error);
        toast({
          title: "Error",
          description: "Failed to load leave applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveApplications();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: LeaveApplication["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "Rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedApplications = [...leaveApplications].sort((a, b) => {
    if (sortKey === "status") {
      return sortOrder === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    if (sortKey === "totalDays") {
      return sortOrder === "asc"
        ? a.totalDays - b.totalDays
        : b.totalDays - a.totalDays;
    }
    const dateA = new Date(a[sortKey]).getTime();
    const dateB = new Date(b[sortKey]).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const filteredApplications =
    statusFilter === "all"
      ? sortedApplications
      : sortedApplications.filter(
          (app) => app.status.toLowerCase() === statusFilter
        );

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string,
    hrComments: string
  ) => {
    try {
      const response = await fetch(
        `/api/hr/update-leave-application-status/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus, hrComments }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update leave application status");
      }

      setLeaveApplications((prevApplications) =>
        prevApplications.map((app) =>
          app._id === applicationId
            ? {
                ...app,
                status: newStatus as LeaveApplication["status"],
                hrComments,
              }
            : app
        )
      );

      toast({
        title: "Success",
        description: `Leave application status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating leave application status:", error);
      toast({
        title: "Error",
        description:
          "Failed to update leave application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCommentChange = (applicationId: string, comment: string) => {
    const maxLength = 50;
    setLeaveApplications((prevApplications) =>
      prevApplications.map((app) =>
        app._id === applicationId ? { ...app, hrComments: comment } : app
      )
    );
    setRemainingCharacters((prev) => ({
      ...prev,
      [applicationId]: maxLength - comment.length,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>All Leave Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredApplications.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No leave applications found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead
                    onClick={() => handleSort("startDate")}
                    className="cursor-pointer"
                  >
                    Start Date{" "}
                    {sortKey === "startDate" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="inline" />
                      ) : (
                        <ChevronDown className="inline" />
                      ))}
                  </TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead
                    onClick={() => handleSort("totalDays")}
                    className="cursor-pointer"
                  >
                    Total Days{" "}
                    {sortKey === "totalDays" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="inline" />
                      ) : (
                        <ChevronDown className="inline" />
                      ))}
                  </TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead
                    onClick={() => handleSort("status")}
                    className="cursor-pointer"
                  >
                    Status{" "}
                    {sortKey === "status" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="inline" />
                      ) : (
                        <ChevronDown className="inline" />
                      ))}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("submissionDate")}
                    className="cursor-pointer"
                  >
                    Submission Date{" "}
                    {sortKey === "submissionDate" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="inline" />
                      ) : (
                        <ChevronDown className="inline" />
                      ))}
                  </TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>
                      {application.employeeId.firstName}{" "}
                      {application.employeeId.lastName}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {application.employeeId.position}
                      </span>
                    </TableCell>
                    <TableCell>{application.leaveType}</TableCell>
                    <TableCell>{formatDate(application.startDate)}</TableCell>
                    <TableCell>{formatDate(application.endDate)}</TableCell>
                    <TableCell>{application.totalDays}</TableCell>
                    <TableCell>{application.reason}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(application.submissionDate)}
                    </TableCell>
                    <TableCell>
                      {application.status === "Pending" ? (
                        <div className="">
                          <Textarea
                            id={`hrComments-${application._id}`}
                            value={application.hrComments || ""}
                            placeholder="Type a comment..."
                            maxLength={50}
                            className="max-h-20"
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                              handleCommentChange(
                                application._id,
                                e.target.value
                              )
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            Remaining characters {remainingCharacters[application._id] ?? 50}
                          </span>
                        </div>
                      ) : (
                        <span className="line-clamp-3">{application.hrComments || "No Comments!"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {application.status === "Pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                "Approved",
                                application.hrComments || ""
                              )
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                "Rejected",
                                application.hrComments || ""
                              )
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
