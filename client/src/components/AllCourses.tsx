import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import YouTube from "react-youtube";
import { Course } from '@/lib/types';

interface AllCoursesProps {
  courses: Course[];
  onEditCourse: (courseId: string, updatedCourse: Partial<Course>) => Promise<void>;
  onDeleteCourse: (courseId: string) => Promise<void>;
}

export const AllCourses: React.FC<AllCoursesProps> = ({ courses, onEditCourse, onDeleteCourse }) => {
  return (
    <div className="flex flex-col space-y-4">
      {courses.map((course) => (
        <Card key={course._id} className="flex flex-row items-start space-x-4">
          <div className="w-1/3">
            <CardHeader>
              <CardTitle className="border-b text-xl">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
          </div>
          <div className="w-1/3">
            <CardContent>
              {course.playlist.map((item) => (
                <div key={item.videoId} className="">
                  <p className="font-medium mb-2 border-b text-xl">{item.title}</p>
                  <div className="aspect-video w-full">
                    <YouTube opts={{ height: "200px", width: "100%" }} videoId={item.videoId} />
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
          <div className="w-1/3">
            <CardFooter className="flex flex-row justify-end space-x-4 mt-7">
              <Button variant="outline" onClick={() => onEditCourse(course._id || "", course)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => onDeleteCourse(course._id || "")}>
                Delete
              </Button>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
};

