'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Video } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/hooks/use-toast"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { useDebounce } from "use-debounce"
import Layout from "@/components/Layout"

// Types based on the Mongoose schema
interface PlaylistItem {
  title: string
  url: string
}

interface Course {
  _id?: string
  title: string
  description: string
  createdBy: string
  playlist: PlaylistItem[]
}

interface EmployeeProgress {
  employeeId: string
  employeeName: string
  courseId: string
  completedItems: string[]
  progress: number
}

interface Employee {
  _id: string;
  name: string;
}

interface AssignedCourse {
  _id: string;
  employeeId: string;
  courseId: string;
}
interface EmployeeMail {
  label: string;
  value: string;
}



export default function CourseManagement() {

  const [courses, setCourses] = useState<any[]>([])
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    playlist: []
  })
  const [newPlaylistItem, setNewPlaylistItem] = useState<PlaylistItem>({
    title: '',
    url: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCourseLoading, setIsCourseLoading] = useState(false);

  const [employeeProgress, setEmployeeProgress] = useState<EmployeeProgress[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
   const [searchTerm, setSearchTerm] = useState("")
   const [employeeMails, setEmployeeMails] = useState<EmployeeMail[]>([]);
  
  
  useEffect(() => {
      const fetchEmployeeMails = async () => {
        try {
          const res = await fetch(`/api/${user?.role === "admin" || user?.role === "hr" ? "hr" : "employee"}/${user?.role === "admin" || user?.role === "hr" ? "employee" : "hr"}-mails`);
          const data = await res.json();
          if (res.ok) {
            setEmployeeMails(
              data.user.map((e: { _id: string; email: string }) => ({
                value: e._id,
                label: e.email,
              }))
            );
          }
        } catch (err) {
          console.error("Error fetching employee emails:", err);
        }
      };
  
      fetchEmployeeMails();
    }, []);
 

  useEffect(() => {
    const fetchCourse = async () => {
      setIsCourseLoading(true);
      try {
        const res = await fetch("/api/employee/get-courses");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "failed to fetch courses")
        }
        setCourses(data.courses);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Sign in Required",
          variant: "destructive",
        });
      } finally {
        setIsCourseLoading(false);
      }
    };
    const fetchEmployees = async (employeeId = '') => {
      try {
        const url = employeeId ? `/api/hr/user/${employeeId}` : '/api/hr/employees';
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch employees');
        }
        setEmployees(data.employees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: 'Error',
          description: 'Sign in Required',
          variant: 'destructive',
        });
      }
    };
    const fetchAssignedCourses = async () => {
      try {
        const res = await fetch('/api/hr/assigned-courses');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch assigned courses');
        }
        setAssignedCourses(data.assignedCourses);
      } catch (error) {
        console.error('Error fetching assigned courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch assigned courses',
          variant: 'destructive'
        });
      }
    };

    fetchCourse();
    fetchEmployees();
    fetchAssignedCourses();
  }, []);

  const handleAddPlaylistItem = () => {
    if (newPlaylistItem.title && newPlaylistItem.url) {
      setNewCourse(prev => ({
        ...prev,
        playlist: [...(prev.playlist || []), newPlaylistItem]
      }))
      setNewPlaylistItem({ title: '', url: '' })
    }
  }

  const handleCreateCourse = async () => {
    if (newCourse.title && newCourse.description && newCourse.playlist?.length) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/hr/add-course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newCourse.title,
            description: newCourse.description,
            playlist: newCourse.playlist
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create course')
        }

        const data = await response.json()

        setCourses(prev => [...prev, data.newCourse])

        setNewCourse({ title: '', description: '', playlist: [] })

        toast({
          title: "Success",
          description: "Course created successfully"
        })
      } catch (error) {
        console.error('Error creating course:', error)
        toast({
          title: "Error",
          description: "Failed to create course",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill all fields and add at least one video to the playlist",
        variant: "destructive"
      })
    }
  }

  const removePlaylistItem = (index: number) => {
    setNewCourse(prev => ({
      ...prev,
      playlist: prev.playlist?.filter((_, i) => i !== index)
    }))
  }

  const handleEditCourse = async (courseId: string) => {
    const courseToEdit = courses.find(c => c._id === courseId)
    if (!courseToEdit) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/employee/edit-course/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: courseToEdit.title,
          description: courseToEdit.description,
          playlist: courseToEdit.playlist
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update course')
      }

      const data = await response.json()

      setCourses(prev =>
        prev.map(course =>
          course._id === courseId ? data.updatedCourse : course
        )
      )

      toast({
        title: "Success",
        description: "Course updated successfully"
      })
    } catch (error) {
      console.error('Error editing course:', error)
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string, index: number) => {
    try {
      const response = await fetch(`/api/hr/delete-course/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast({
        title: "Success",
        description: "Course deleted successfully!",
      });

      setCourses((prevCourses) => prevCourses.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedCourse || selectedEmployees.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a course and at least one employee",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/hr/assign-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          employeeIds: selectedEmployees,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign course");
      }

      toast({
        title: "Success",
        description: "Course assigned successfully",
      });
      setAssignedCourses([...assignedCourses, data.newAssignment]);
      setSelectedCourse(null);
      setSelectedEmployees([]);
    } catch (error) {
      console.error("Error assigning course:", error);
      toast({
        title: "Error",
        description: "Failed to assign course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignCourse = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/hr/unassign-course/${assignmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to unassign course');
      }

      toast({
        title: 'Success',
        description: 'Course unassigned successfully'
      });

      setAssignedCourses(prev => prev.filter(assignment => assignment._id !== assignmentId));
    } catch (error) {
      console.error('Error unassigning course:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign course',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="create" className="space-y-6">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="create">Create Course</TabsTrigger>
              <TabsTrigger value="progress">Employee Progress</TabsTrigger>
              <TabsTrigger value="all-courses">All Courses</TabsTrigger>
              <TabsTrigger value="assign-course">Assign Courses</TabsTrigger>
            </TabsList>
          </div>

          {/* Create Course */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
                <CardDescription>Add a new training course for employees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Course Title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={isLoading}
                  />
                  <Textarea
                    placeholder="Course Description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, description: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Add Playlist Videos</h4>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Video Title"
                      value={newPlaylistItem.title}
                      onChange={(e) =>
                        setNewPlaylistItem((prev) => ({ ...prev, title: e.target.value }))
                      }
                      disabled={isLoading}
                    />
                    <Input
                      placeholder="Video URL"
                      value={newPlaylistItem.url}
                      onChange={(e) => setNewPlaylistItem((prev) => ({ ...prev, url: e.target.value }))}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleAddPlaylistItem}
                      disabled={isLoading || !newPlaylistItem.title || !newPlaylistItem.url}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {newCourse.playlist?.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {newCourse.playlist.map((item, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>{item.title}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePlaylistItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleCreateCourse} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Course"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Employee Progress */}
          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Employee Progress</CardTitle>
                <CardDescription>Track progress of employees in courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeProgress.map((progress, index) => (
                      <TableRow key={index}>
                        <TableCell>{progress.employeeName}</TableCell>
                        <TableCell>
                          {courses.find((course) => course._id === progress.courseId)?.title}
                        </TableCell>
                        <TableCell>
                          <Progress value={progress.progress} />
                          <span className="text-sm">{progress.progress}%</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Courses */}
          <TabsContent value="all-courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Card key={course._id}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="playlist">
                        <AccordionTrigger>Playlist</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-4">
                            {course.playlist.map((item, idx) => (
                              <li key={idx} className="border-b pb-4">
                                <p className="font-medium mb-2">{item.title}</p>
                                <div className="aspect-video w-full">
                                  {item.url.includes("youtube.com") || item.url.includes("youtu.be") ? (
                                    <iframe
                                      src={item.url.replace("watch?v=", "embed/")}
                                      title={item.title}
                                      allowFullScreen
                                      className="w-full h-full"
                                    />
                                  ) : (
                                    <video
                                      src={item.url}
                                      controls
                                      preload="metadata"
                                      className="w-full h-full"
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleEditCourse(course._id || "")}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteCourse(course._id || "", index)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assign Courses */}
          <TabsContent value="assign-course">
            <Card>
              <CardHeader>
                <CardTitle>Assign Course</CardTitle>
                <CardDescription>Assign courses to employees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeSelect">Select Employee(s)</Label>
                  <Button variant="outline" className="w-full justify-between capitalize">
                  {employeeMails.find((m) => m.value === mailData.receiver)
                    ?.label || `Select a ${user?.role === "admin" || user?.role === "hr" ? "employee" : "hr"}`}
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employees" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseSelect">Select Course</Label>
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAssignCourse}
                  disabled={isLoading || selectedEmployees.length === 0 || !selectedCourse}
                >
                  {isLoading ? "Assigning..." : "Assign Course"}
                </Button>
              </CardContent>

              <CardContent className="mt-6">
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
                      {assignedCourses.map((assignment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {employees.find((emp) => emp._id === assignment.employeeId)?.name}
                          </TableCell>
                          <TableCell>
                            {courses.find((course) => course._id === assignment.courseId)?.title}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUnassignCourse(assignment._id)}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>

  );
}

