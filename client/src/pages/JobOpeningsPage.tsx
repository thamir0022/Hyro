import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface ContactInfo {
  email: string;
  phone: string;
}

interface PostedBy {
  _id: string;
  firstName: string;
  lastName: string;
}

interface JobOpening {
  _id: string;
  title: string;
  description: string;
  jobType: string;
  department: string;
  location: string;
  salaryRange: string;
  workHours: string;
  experienceRequired: string;
  qualifications: string[];
  skillsRequired: string[];
  applicationDeadline: string;
  jobStatus: string;
  contactInfo: ContactInfo;
  postedBy: PostedBy;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  allJobs: JobOpening[];
}

const JobOpenings: React.FC = () => {
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobOpenings = async () => {
      try {
        const response = await fetch("/api/employee/get-all-job-openings");
        const data: ApiResponse = await response.json();
        setJobOpenings(data.allJobs);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch job openings. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchJobOpenings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-center text-3xl font-libre my-4">Job Openings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-10 py-5">
        {jobOpenings.map((job) => (
          <Card key={job._id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{job.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">{job.description}</p>
              <div className="mb-4">
                <p className="text-sm">
                  <span className="font-semibold">Department:</span>{" "}
                  {job.department}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Location:</span>{" "}
                  {job.location}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Job Type:</span> {job.jobType}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Salary Range:</span>{" "}
                  {job.salaryRange}
                </p>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Required Skills:</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Link to={`/apply-job/${job._id}`}><Button>View Details</Button></Link>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground">
                  Posted by: {job.postedBy.firstName} {job.postedBy.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Dead line: {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default JobOpenings;
