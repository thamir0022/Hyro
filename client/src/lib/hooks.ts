import { useState, useEffect } from 'react';
import { fetchData, handleError } from './utils';
import { Course, EmployeeMail, AssignedCourse, EmployeeProgressResponse, AssignCourse } from '@/lib/types';
import { toast } from "@/hooks/use-toast";

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData<{ courses: Course[] }>("/api/employee/get-courses");
        setCourses(data.courses);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const createCourse = async (newCourse: Omit<Course, "_id">) => {
    setIsLoading(true);
    try {
      const data = await fetchData<{ newCourse: Course }>("/api/hr/add-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });
      setCourses((prev) => [...prev, data.newCourse]);
      toast({ title: "Success", description: "Course created successfully" });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const editCourse = async (courseId: string, updatedCourse: Partial<Course>) => {
    setIsLoading(true);
    try {
      const data = await fetchData<{ updatedCourse: Course }>(`/api/employee/edit-course/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCourse),
      });
      setCourses((prev) => prev.map((course) => course._id === courseId ? data.updatedCourse : course));
      toast({ title: "Success", description: "Course updated successfully" });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await fetchData(`/api/hr/delete-course/${courseId}`, { method: "DELETE" });
      setCourses((prev) => prev.filter((course) => course._id !== courseId));
      toast({ title: "Success", description: "Course deleted successfully!" });
    } catch (error) {
      handleError(error);
    }
  };

  return { courses, isLoading, createCourse, editCourse, deleteCourse };
};

export const useEmployeeProgress = () => {
  const [progressData, setProgressData] = useState<EmployeeProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEmployeeProgress = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData<EmployeeProgressResponse>('/api/hr/get-all-employee-progress');
        setProgressData(data);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeProgress();
  }, []);

  return { progressData, isLoading };
};

export const useAssignCourses = () => {
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [employeeMails, setEmployeeMails] = useState<EmployeeMail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [assignedCoursesData, employeeMailsData] = await Promise.all([
          fetchData<{ assignedCourses: AssignedCourse[] }>("/api/hr/assigned-courses"),
          fetchData<{ user: { _id: string; email: string }[] }>("/api/hr/employee-mails"),
        ]);
        setAssignedCourses(assignedCoursesData.assignedCourses);
        setEmployeeMails(employeeMailsData.user.map(e => ({ value: e._id, label: e.email })));
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const assignCourse = async (assignCourseData: AssignCourse) => {
    setIsLoading(true);
    try {
      const data = await fetchData<{ newAssignment: AssignedCourse }>("/api/hr/assign-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignCourseData),
      });
      setAssignedCourses(prev => [...prev, data.newAssignment]);
      toast({ title: "Success", description: "Course assigned successfully" });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const unassignCourse = async (assignmentId: string) => {
    try {
      await fetchData(`/api/hr/unassign-course/${assignmentId}`, { method: "DELETE" });
      setAssignedCourses(prev => prev.filter(assignment => assignment._id !== assignmentId));
      toast({ title: "Success", description: "Course unassigned successfully" });
    } catch (error) {
      handleError(error);
    }
  };

  return { assignedCourses, employeeMails, isLoading, assignCourse, unassignCourse };
};

