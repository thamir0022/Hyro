import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import YouTube from 'react-youtube';
import { Button } from "@/components/ui/button";

export const VideoPlayer: React.FC = () => {
  const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>();
  const { courses } = useCourses();

  const course = courses.find(c => c._id === courseId);
  const video = course?.playlist.find(v => v.videoId === videoId);

  useEffect(() => {
    // Here you would typically update the progress when the video starts playing
    // This is just a placeholder and should be replaced with actual API call
    console.log(`Video ${videoId} started playing`);
  }, [videoId]);

  if (!video) return <div>Video not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
      <div className="aspect-video mb-4">
        <YouTube videoId={video.videoId} opts={{ width: '100%', height: '100%' }} />
      </div>
      <Button asChild>
        <Link to={`/course/${courseId}`}>Back to Course</Link>
      </Button>
    </div>
  );
};

