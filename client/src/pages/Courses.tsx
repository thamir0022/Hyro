'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, PlayCircle, BookOpen, BarChart, User } from 'lucide-react'
import Layout from "@/components/Layout"

// Types
interface PlaylistItem {
  id: string
  title: string
  url: string
  duration: string
  completed: boolean
}

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  category: string
  playlist: PlaylistItem[]
}

interface EmployeeCourseProgress {
  courseId: string
  completedItems: string[]
  overallProgress: number
}

export default function EmployeeCourses() {
  // Mock data - in a real app, this would come from an API
  const [courses] = useState<Course[]>([
    {
      id: "1",
      title: "Introduction to React",
      description: "Learn the basics of React and build your first app",
      instructor: "Jane Doe",
      category: "Web Development",
      playlist: [
        { id: "1-1", title: "React Fundamentals", url: "https://example.com/video1", duration: "15:30", completed: false },
        { id: "1-2", title: "Components and Props", url: "https://example.com/video2", duration: "20:45", completed: false },
        { id: "1-3", title: "State and Lifecycle", url: "https://example.com/video3", duration: "18:20", completed: false },
      ]
    },
    {
      id: "2",
      title: "Advanced JavaScript",
      description: "Deep dive into JavaScript concepts for experienced developers",
      instructor: "John Smith",
      category: "Programming",
      playlist: [
        { id: "2-1", title: "Closures and Scopes", url: "https://example.com/video4", duration: "22:15", completed: false },
        { id: "2-2", title: "Promises and Async Programming", url: "https://example.com/video5", duration: "25:00", completed: false },
        { id: "2-3", title: "ES6+ Features", url: "https://example.com/video6", duration: "19:45", completed: false },
      ]
    }
  ])

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [progress, setProgress] = useState<EmployeeCourseProgress[]>([
    { courseId: "1", completedItems: [], overallProgress: 0 },
    { courseId: "2", completedItems: [], overallProgress: 0 },
  ])

  const handleVideoComplete = (courseId: string, videoId: string) => {
    setProgress(prevProgress => {
      const courseProgress = prevProgress.find(p => p.courseId === courseId)
      if (courseProgress) {
        const updatedCompletedItems = courseProgress.completedItems.includes(videoId)
          ? courseProgress.completedItems
          : [...courseProgress.completedItems, videoId]
        
        const course = courses.find(c => c.id === courseId)
        const overallProgress = course 
          ? (updatedCompletedItems.length / course.playlist.length) * 100
          : 0

        return prevProgress.map(p => 
          p.courseId === courseId 
            ? { ...p, completedItems: updatedCompletedItems, overallProgress }
            : p
        )
      }
      return prevProgress
    })
  }

  const isVideoCompleted = (courseId: string, videoId: string) => {
    const courseProgress = progress.find(p => p.courseId === courseId)
    return courseProgress?.completedItems.includes(videoId) || false
  }

  return (
    <Layout>
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Learning Dashboard</h1>
        <Avatar>
          <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
      </div>
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="progress">Learning Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.playlist.length} lessons</span>
                  </div>
                  <Progress 
                    value={progress.find(p => p.courseId === course.id)?.overallProgress || 0} 
                    className="mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    {progress.find(p => p.courseId === course.id)?.completedItems.length || 0} of {course.playlist.length} completed
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{course.instructor}</span>
                  </div>
                  <Button onClick={() => setSelectedCourse(course)}>Continue</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">My Learning Progress</CardTitle>
              <CardDescription>Track your progress across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.map(course => (
                <div key={course.id} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">{course.title}</h3>
                    <Badge variant="outline">
                      {progress.find(p => p.courseId === course.id)?.completedItems.length || 0}/{course.playlist.length} completed
                    </Badge>
                  </div>
                  <Progress 
                    value={progress.find(p => p.courseId === course.id)?.overallProgress || 0} 
                    className="mb-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(progress.find(p => p.courseId === course.id)?.overallProgress || 0)}% complete
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedCourse && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{selectedCourse.title}</CardTitle>
                <CardDescription>{selectedCourse.description}</CardDescription>
              </div>
              <Badge variant="secondary">{selectedCourse.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {selectedCourse.playlist.map(video => (
                <div key={video.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex items-center space-x-4">
                    {isVideoCompleted(selectedCourse.id, video.id) ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <PlayCircle className="h-6 w-6 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium">{video.title}</p>
                      <p className="text-sm text-muted-foreground">{video.duration}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={isVideoCompleted(selectedCourse.id, video.id) ? "outline" : "default"}
                    onClick={() => handleVideoComplete(selectedCourse.id, video.id)}
                  >
                    {isVideoCompleted(selectedCourse.id, video.id) ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>{selectedCourse.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{selectedCourse.instructor}</p>
                <p className="text-xs text-muted-foreground">Course Instructor</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedCourse(null)}>Back to Courses</Button>
          </CardFooter>
        </Card>
      )}
    </div>
    </Layout>
  )
}

