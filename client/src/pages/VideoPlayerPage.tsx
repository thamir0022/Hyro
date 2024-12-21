import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import YouTube from "react-youtube";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCourses } from "../hooks/useCourses";
import { useCourseProgress } from "../hooks/useCourses";
import { Video } from "@/lib/types";
import Layout from "@/components/Layout";

const VideoPlayerPage: React.FC = () => {
  const { courseId, videoId } = useParams<{
    courseId: string;
    videoId: string;
  }>();
  const navigate = useNavigate();
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = useCourses();
  const {
    progress,
    loading: progressLoading,
    error: progressError,
    updateProgress,
  } = useCourseProgress(courseId || "");
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (courses && courseId && videoId) {
      const course = courses.find((c) => c.courseId === courseId);
      if (course) {
        const video = course.playlist.find((v) => v._id === videoId);
        setCurrentVideo(video || null);
      }
    }
  }, [courses, courseId, videoId]);

  if (coursesLoading || progressLoading) return <div>Loading...</div>;
  if (coursesError)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{coursesError}</AlertDescription>
      </Alert>
    );
  if (progressError)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{progressError}</AlertDescription>
      </Alert>
    );

  const course = courses.find((c) => c.courseId === courseId);
  if (!course || !currentVideo)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Video not found</AlertDescription>
      </Alert>
    );

  const handleVideoEnd = async () => {
    if (currentVideo) {
      await updateProgress(currentVideo._id);
    }
  };

  const navigateVideo = (direction: "prev" | "next") => {
    const currentIndex = course.playlist.findIndex(
      (v) => v._id === currentVideo._id
    );
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < course.playlist.length) {
      const newVideo = course.playlist[newIndex];
      navigate(`/my-course/${courseId}/video/${newVideo._id}`);
    }
  };

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{currentVideo.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <YouTube
              videoId={currentVideo.videoId}
              opts={{ width: "100%", height: "600px"}}
              onEnd={handleVideoEnd}
            />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => navigateVideo("prev")}
            disabled={course.playlist[0]._id === currentVideo._id}
          >
            Previous
          </Button>
          <Button onClick={() => navigate(`/my-course/${courseId}`)}>
            Back to Course
          </Button>
          <Button
            onClick={() => navigateVideo("next")}
            disabled={
              course.playlist[course.playlist.length - 1]._id ===
              currentVideo._id
            }
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </Layout>
  );
};

export default VideoPlayerPage;
