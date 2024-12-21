import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { CreateCourse } from '@/components/CreateCourse';
import { EmployeeProgress } from '@/components/EmployeeProgress';
import { AllCourses } from '@/components/AllCourses';
import { AssignCourses } from '@/pages/AssignCouse';
import { useCourses, useEmployeeProgress, useAssignCourses } from '@/lib/hooks';

const CourseManagement: React.FC = () => {
  const { courses, isLoading: coursesLoading, createCourse, editCourse, deleteCourse } = useCourses();
  const { progressData, isLoading: progressLoading } = useEmployeeProgress();
  const {
    assignedCourses,
    isLoading: assignCoursesLoading,
    assignCourse,
    unassignCourse,
  } = useAssignCourses();
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="create" className="space-y-6">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="create">Create Course</TabsTrigger>
              <TabsTrigger value="progress">Employee Progress</TabsTrigger>
              <TabsTrigger value="all-courses">All Courses</TabsTrigger>
              <TabsTrigger value="assign-course">Assign Courses</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create">
            <CreateCourse onCreateCourse={createCourse} isLoading={coursesLoading} />
          </TabsContent>

          <TabsContent value="progress">
            <EmployeeProgress progressData={progressData} />
          </TabsContent>

          <TabsContent value="all-courses">
            <AllCourses courses={courses} onEditCourse={editCourse} onDeleteCourse={deleteCourse} />
          </TabsContent>

          <TabsContent value="assign-course">
            <AssignCourses
              courses={courses}
              assignedCourses={assignedCourses}
              onAssignCourse={assignCourse}
              onUnassignCourse={unassignCourse}
              isLoading={assignCoursesLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CourseManagement;

