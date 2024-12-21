export interface PlaylistItem {
  title: string;
  videoId: string;
}

export interface Course {
  _id?: string;
  title: string;
  description: string;
  createdBy: string;
  playlist: PlaylistItem[];
}

export interface EmployeeMail {
  value: string;
  label: string;
}

export interface AssignedCourse {
  _id: string;
  employeeId: string;
  courseId: string;
}

export interface EmployeeProgress {
  courseId: string;
  courseTitle: string;
  employeeId: string;
  employeeEmail: string;
  totalVideos: number;
  videosWatched: number;
  watchedPercentage: number;
  completed: boolean;
}

export interface EmployeeProgressResponse {
  success: boolean;
  totalCourses: number;
  employeeProgress: EmployeeProgress[];
}

export interface AssignCourse {
  courseId: string;
  employeeIds: string[];
}

export interface Video {
  title: string;
  videoId: string;
  _id: string;
}

export interface Course {
  courseId: string;
  title: string;
  description: string;
  playlist: Video[];
  createdBy: {
    _id: string;
    email: string;
  };
  progress: null | {
    courseId: string;
    totalVideos: number;
    completed: boolean;
    videosWatched: string[];
  };
}

export interface CourseProgress {
  courseId: string;
  totalVideos: number;
  completed: boolean;
  videosWatched: string[];
}
