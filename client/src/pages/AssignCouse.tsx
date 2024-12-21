import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, ChevronsUpDown } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Course, EmployeeMail, AssignedCourse } from '@/lib/types';

interface AssignCoursesProps {
  courses: Course[];
  assignedCourses: AssignedCourse[];
  onAssignCourse: (assignCourse: { courseId: string; employeeIds: string[] }) => Promise<void>;
  onUnassignCourse: (assignmentId: string) => Promise<void>;
  isLoading: boolean;
}

export const AssignCourses: React.FC<AssignCoursesProps> = ({
  courses,
  assignedCourses,
  onAssignCourse,
  onUnassignCourse,
  isLoading,
}) => {
  const [openComboBox, setOpenComboBox] = useState(false);
  const [assignCourse, setAssignCourse] = useState<{ courseId: string; employeeIds: string[] }>({
    courseId: "",
    employeeIds: [],
  });
  const [employeeMails, setEmployeeMails] = useState<EmployeeMail[]>([]);

  const handleAssignCourse = () => {
    if (assignCourse.courseId && assignCourse.employeeIds.length > 0) {
      onAssignCourse(assignCourse);
      setAssignCourse({ courseId: "", employeeIds: [] });
    } else {
      toast({
        title: "Validation Error",
        description: "Please select a course and at least one employee",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchEmployeeMails = async() => {
      const res = await fetch('/api/hr/employee-mails');
      const data: any = await res.json();

      if(res.ok){
        setEmployeeMails(data.user.map(e => ({ value: e._id, label: e.email })));
      }
    }
    fetchEmployeeMails();
  },[]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Course</CardTitle>
        <CardDescription>Assign courses to employees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={openComboBox} onOpenChange={setOpenComboBox}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {assignCourse.employeeIds.length > 0
                ? employeeMails
                    .filter((m) => assignCourse.employeeIds.includes(m.value))
                    .map((m) => m.label)
                    .join(", ")
                : "Select Employee"}
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[800px] p-0">
            <Command>
              <CommandInput placeholder="Search employee..." />
              <CommandList>
                <CommandEmpty>No employee found.</CommandEmpty>
                <CommandGroup>
                  {employeeMails.map((mail) => (
                    <CommandItem
                      key={mail.value}
                      onSelect={() => {
                        setAssignCourse((prev) => ({
                          ...prev,
                          employeeIds: prev.employeeIds.includes(mail.value)
                            ? prev.employeeIds.filter((id) => id !== mail.value)
                            : [...prev.employeeIds, mail.value],
                        }));
                        setOpenComboBox(false);
                      }}
                    >
                      <Avatar className="size-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${mail.label[0]} ${mail.label[1]}`}
                        />
                        <AvatarFallback>
                          {mail.label[0]}
                          {mail.label[1]}
                        </AvatarFallback>
                      </Avatar>
                      {mail.label}
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          assignCourse.employeeIds.includes(mail.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select
          value={assignCourse.courseId}
          onValueChange={(value) => setAssignCourse((prev) => ({ ...prev, courseId: value }))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select A Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Courses</SelectLabel>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id as string}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          onClick={handleAssignCourse}
          disabled={isLoading || assignCourse.employeeIds.length < 1 || !assignCourse.courseId}
        >
          {isLoading ? "Assigning..." : "Assign Course"}
        </Button>

        <div className="mt-6">
          <h4 className="font-medium">Assigned Courses</h4>
          {assignedCourses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedCourses.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell>
                      {employeeMails.find((emp) => emp.value === assignment.employeeId)?.label}
                    </TableCell>
                    <TableCell>
                      {courses.find((course) => course._id === assignment.courseId)?.title}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onUnassignCourse(assignment._id)}
                      >
                        Unassign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-gray-500">No courses assigned yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

