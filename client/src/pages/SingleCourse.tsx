import React from "react";
import { useParams, Link } from "react-router-dom";
import { useCourses, useCourseProgress } from "../hooks/useCourses";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";

export const SingleCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses } = useCourses();
  const { progress, loading: progressLoading } = useCourseProgress(
    courseId || ""
  );

  const course = courses.find((c) => c.courseId === courseId);

  if (!course) return <div>Course not found</div>;

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
        <Card>
          <CardHeader>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Course Content</h2>
            {progressLoading ? (
              <div>Loading progress...</div>
            ) : (
              <Progress
                value={
                  ((progress?.videosWatched.length || 0) /
                    (progress?.totalVideos || 1)) *
                  100
                }
                className="mb-4"
              />
            )}
            {course.playlist.map((video, index) => (
              <div key={video._id} className="mb-2">
                <Button asChild variant="link">
                  <Link to={`/my-course/${courseId}/video/${video._id}`}>
                    {index + 1}. {video.title}
                  </Link>
                </Button>
                {progress?.videosWatched.includes(video._id) && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
