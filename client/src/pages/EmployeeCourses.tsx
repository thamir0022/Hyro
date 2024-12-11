'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Video, ChevronDown, ChevronUp } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Layout from "@/components/Layout"

// Types based on the Mongoose model
interface PlaylistItem {
  title: string
  url: string
}

interface Course {
  id: string
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

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    playlist: []
  })
  const [newPlaylistItem, setNewPlaylistItem] = useState<PlaylistItem>({
    title: '',
    url: ''
  })
  
  // Mock employee progress data
  const [employeeProgress] = useState<EmployeeProgress[]>([
    {
      employeeId: '1',
      employeeName: 'John Doe',
      courseId: '1',
      completedItems: ['1', '2'],
      progress: 75
    },
    {
      employeeId: '2',
      employeeName: 'Jane Smith',
      courseId: '1',
      completedItems: ['1'],
      progress: 25
    }
  ])

  const handleAddPlaylistItem = () => {
    if (newPlaylistItem.title && newPlaylistItem.url) {
      setNewCourse(prev => ({
        ...prev,
        playlist: [...(prev.playlist || []), newPlaylistItem]
      }))
      setNewPlaylistItem({ title: '', url: '' })
    }
  }

  const handleCreateCourse = () => {
    if (newCourse.title && newCourse.description) {
      const course: Course = {
        id: Date.now().toString(),
        title: newCourse.title,
        description: newCourse.description,
        createdBy: 'current-user-id', // This would come from auth context
        playlist: newCourse.playlist || []
      }
      setCourses(prev => [...prev, course])
      setNewCourse({ title: '', description: '', playlist: [] })
    }
  }

  const removePlaylistItem = (index: number) => {
    setNewCourse(prev => ({
      ...prev,
      playlist: prev.playlist?.filter((_, i) => i !== index)
    }))
  }

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
                />
                <Textarea
                  placeholder="Course Description"
                  value={newCourse.description}
                  onChange={e => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Course Playlist</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Video Title"
                    value={newPlaylistItem.title}
                    onChange={e => setNewPlaylistItem(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Input
                    placeholder="Video URL"
                    value={newPlaylistItem.url}
                    onChange={e => setNewPlaylistItem(prev => ({ ...prev, url: e.target.value }))}
                  />
                  <Button onClick={handleAddPlaylistItem}>
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
                      <Button variant="ghost" size="sm" onClick={() => removePlaylistItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateCourse}>Create Course</Button>
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
                        {courses.find(c => c.id === progress.courseId)?.title || 'Course Title'}
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
              <Accordion type="single" collapsible className="w-full">
                {courses.map((course, index) => (
                  <AccordionItem value={`item-${index}`} key={course.id}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full">
                        <span>{course.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {course.playlist.length} videos
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                        <h4 className="font-medium">Playlist:</h4>
                        <ul className="space-y-1">
                          {course.playlist.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                                {item.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </Layout>
  )
}

