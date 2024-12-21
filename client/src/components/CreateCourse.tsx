import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Course, PlaylistItem } from '@/lib/types';

interface CreateCourseProps {
  onCreateCourse: (course: Omit<Course, "_id">) => Promise<void>;
  isLoading: boolean;
}

export const CreateCourse: React.FC<CreateCourseProps> = ({ onCreateCourse, isLoading }) => {
  const [newCourse, setNewCourse] = useState<Omit<Course, "_id" | "createdBy">>({
    title: "",
    description: "",
    playlist: [],
  });
  const [newPlaylistItem, setNewPlaylistItem] = useState<PlaylistItem>({ title: "", videoId: "" });

  const handleAddPlaylistItem = () => {
    if (newPlaylistItem.title && newPlaylistItem.videoId) {
      setNewCourse(prev => ({
        ...prev,
        playlist: [...prev.playlist, newPlaylistItem],
      }));
      setNewPlaylistItem({ title: "", videoId: "" });
    }
  };

  const removePlaylistItem = (index: number) => {
    setNewCourse(prev => ({
      ...prev,
      playlist: prev.playlist.filter((_, i) => i !== index),
    }));
  };

  const handleCreateCourse = () => {
    if (newCourse.title && newCourse.description && newCourse.playlist.length > 0) {
      onCreateCourse(newCourse);
      setNewCourse({ title: "", description: "", playlist: [] });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill all fields and add at least one video to the playlist",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription>Add a new training course for employees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Course Title"
          value={newCourse.title}
          onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
          disabled={isLoading}
        />
        <Textarea
          placeholder="Course Description"
          value={newCourse.description}
          onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
          disabled={isLoading}
        />
        <div>
          <h4 className="font-medium mb-2">Add Playlist Videos</h4>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Video Title"
              value={newPlaylistItem.title}
              onChange={(e) => setNewPlaylistItem(prev => ({ ...prev, title: e.target.value }))}
              disabled={isLoading}
            />
            <Input
              placeholder="Video ID"
              value={newPlaylistItem.videoId}
              onChange={(e) => setNewPlaylistItem(prev => ({ ...prev, videoId: e.target.value }))}
              disabled={isLoading}
            />
            <Button onClick={handleAddPlaylistItem} disabled={isLoading || !newPlaylistItem.title || !newPlaylistItem.videoId}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {newCourse.playlist.length > 0 && (
            <ul className="mt-4 space-y-2">
              {newCourse.playlist.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{item.title}</span>
                  <Button variant="ghost" size="sm" onClick={() => removePlaylistItem(index)}>
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
  );
};

