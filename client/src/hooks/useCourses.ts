import { useState, useEffect, useCallback } from 'react';
import { Course, CourseProgress } from '@/lib/types';

const EMPLOYEE_ID = '675d12e882eca93ede66f02d'; // This should be dynamically set based on the logged-in user


export const useCourseProgress = (courseId: string) => {
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/employee/${EMPLOYEE_ID}/course/${courseId}/progress`);
        if (!response.ok) {
          throw new Error('Failed to fetch course progress');
        }
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId]);

  const updateProgress = async (videoId: string) => {
    try {
      const response = await fetch(`/api/employee/${EMPLOYEE_ID}/course/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });
      
      if (!response.ok) throw new Error('Failed to update progress');
      
      const updatedProgress = await response.json();
      setProgress(updatedProgress);
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  return { progress, loading, error, updateProgress };
};



export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/employee/${EMPLOYEE_ID}/courses`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

