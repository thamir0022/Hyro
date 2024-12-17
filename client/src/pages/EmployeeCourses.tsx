'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Video } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Layout from "@/components/Layout"
import { toast } from "@/hooks/use-toast" // Assuming you have a toast component
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// Types based on the Mongoose
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

  // Mock employee progress data (you'd fetch this from an API in a real app)
  const [employeeProgress, setEmployeeProgress] = useState<EmployeeProgress[]>([])

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]); // Add state for employees

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

    fetchCourse();
    fetchEmployees();
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

        // Add the new course to the list
        setCourses(prev => [...prev, data.newCourse])

        // Reset form
        setNewCourse({ title: '', description: '', playlist: [] })

        // Show success toast
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

      // Update the course in the list
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

      // Optionally reset selections
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


  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create">Create Course</TabsTrigger>
            <TabsTrigger value="progress">Employee Progress</TabsTrigger>
            <TabsTrigger value="all-courses">All Courses</TabsTrigger>
          </TabsList>

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
                    onChange={e => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                    disabled={isLoading}
                  />
                  <Textarea
                    placeholder="Course Description"
                    value={newCourse.description}
                    onChange={e => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Course Playlist</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Video Title"
                      value={newPlaylistItem.title}
                      onChange={e => setNewPlaylistItem(prev => ({ ...prev, title: e.target.value }))}
                      disabled={isLoading}
                    />
                    <Input
                      placeholder="Video URL"
                      value={newPlaylistItem.url}
                      onChange={e => setNewPlaylistItem(prev => ({ ...prev, url: e.target.value }))}
                      disabled={isLoading}
                    />
                    <Button onClick={handleAddPlaylistItem} disabled={isLoading}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {newCourse.playlist?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlaylistItem(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Assignment Section */}
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Assign Course</h3>
                  <Select
                    value={selectedCourse || ""}
                    onValueChange={(value) => setSelectedCourse(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    multiple
                    value={selectedEmployees}
                    onValueChange={(values) => setSelectedEmployees(Array.isArray(values) ? values : [values])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button onClick={handleAssignCourse} disabled={isLoading}>
                    {isLoading ? "Assigning..." : "Assign Course"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleCreateCourse}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Course'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Employee Progress</CardTitle>
                <CardDescription>Monitor employee progress on courses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Completed Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeProgress.map((progress) => (
                      <TableRow key={`${progress.employeeId}-${progress.courseId}`}>
                        <TableCell>{progress.employeeName}</TableCell>
                        <TableCell>
                          {courses.find(c => c._id === progress.courseId)?.title || 'Course Title'}
                        </TableCell>
                        <TableCell>
                          <div className="w-[100px]">
                            <Progress value={progress.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{progress.completedItems.length} items</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-courses">
            <Card>
              <CardHeader>
                <CardTitle>All Courses</CardTitle>
                <CardDescription>View and manage all created courses</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Loading courses...</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {courses.map((courses, index) => (
                      <AccordionItem value={`item-${index}`} key={courses._id}>
                        <AccordionTrigger>
                          <div className="flex justify-between w-full">
                            <span>{courses.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {courses.playlist.length} videos
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">{courses.description}</p>
                            <h4 className="font-medium">Playlist:</h4>
                            <ul className="space-y-1">
                              {courses.playlist.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:underline"
                                  >
                                    {item.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                            <div className="flex justify-end space-x-2 mt-2">
                              <Button
                                variant="outline"
                                onClick={() => handleEditCourse(courses._id || '')}
                                disabled={isLoading}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteCourse(courses._id || '', index)}
                                disabled={isLoading}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}