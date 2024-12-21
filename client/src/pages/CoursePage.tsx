import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCourses } from "../hooks/useCourses";
import Layout from "@/components/Layout";

const CoursesPage: React.FC = () => {
  const { courses, loading, error } = useCourses();

  if (loading) return <div>Loading courses...</div>;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );

  return (
    <Layout>
      <h2 className="text-center font-semibold text-3xl my-3">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course.courseId} className="flex flex-col">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>
                {course.description.slice(0, 100)}...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Videos: {course.playlist.length}</p>
              {course.progress && (
                <Progress
                  value={
                    (course.progress.videosWatched.length /
                      course.progress.totalVideos) *
                    100
                  }
                  className="mt-2"
                />
              )}
            </CardContent>
            <CardFooter className="mt-auto">
              <Link to={`/my-course/${course.courseId}`}>
                <Button>View Course</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default CoursesPage;
