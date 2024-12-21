import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { EmployeeProgressResponse } from '@/lib/types';

interface EmployeeProgressProps {
  progressData: EmployeeProgressResponse | null;
}

export const EmployeeProgress: React.FC<EmployeeProgressProps> = ({ progressData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Progress</CardTitle>
        <CardDescription>Track progress of employees in courses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Email</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progressData?.employeeProgress.map((progress, index) => (
              <TableRow key={index}>
                <TableCell>{progress.employeeEmail}</TableCell>
                <TableCell>{progress.courseTitle}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Progress value={progress.watchedPercentage} className="w-[60%]" />
                    <span className="text-sm ml-2">{progress.watchedPercentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

