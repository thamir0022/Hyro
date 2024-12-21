import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCourses } from '@/lib/hooks';
import { useCourseProgress } from '@/hooks/useCourses';
import { Video } from '@/lib/types';

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const { progress, loading: progressLoading, error: progressError } = useCourseProgress(courseId || '');

  if (coursesLoading || progressLoading) return <div>Loading...</div>;
  if (coursesError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{coursesError}</AlertDescription></Alert>;
  if (progressError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{progressError}</AlertDescription></Alert>;

  const course = courses.find(c => c.courseId === courseId);
  if (!course) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Course not found</AlertDescription></Alert>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-semibold mb-2">Course Content</h2>
        {progress && (
          <Progress 
            value={(progress.videosWatched.length / progress.totalVideos) * 100} 
            className="mb-4"
          />
        )}
        <ScrollArea className="h-[300px]">
          {course.playlist.map((video: Video, index: number) => (
            <div key={video._id} className="mb-2">
              <Link to={`/course/${courseId}/video/${video._id}`}>
                <Button 
                  variant="link" 
                  className="justify-start"
                >
                  {index + 1}. {video.title}
                </Button>
              </Link>
              {progress?.videosWatched.includes(video._id) && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CourseDetailsPage;

