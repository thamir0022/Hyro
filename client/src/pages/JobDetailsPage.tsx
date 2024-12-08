import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useParams } from 'react-router-dom';

interface ContactInfo {
  email: string;
  phone: string;
}

interface PostedBy {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Job {
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
  job: Job;
}

export default function JobDetails() {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const jobId = params.id as string;


  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/employee/job/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        const data: ApiResponse = await response.json();
        setJob(data.job);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch job details. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-warning/10 border border-warning text-warning px-4 py-3 rounded" role="alert">
          <p className="font-bold">Job Not Found</p>
          <p>The requested job details could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
          <p className="text-muted-foreground">{job.department} - {job.location}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Job Description</h2>
              <p>{job.description}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Job Details</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-semibold">Job Type:</span> {job.jobType}</li>
                <li><span className="font-semibold">Salary Range:</span> {job.salaryRange}</li>
                <li><span className="font-semibold">Work Hours:</span> {job.workHours}</li>
                <li><span className="font-semibold">Experience Required:</span> {job.experienceRequired}</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Qualifications</h2>
              <ul className="list-disc list-inside">
                {job.qualifications.map((qualification, index) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
              <p className="font-semibold">Email: <a href={`mailto:${job.contactInfo.email}`}>{job.contactInfo.email}</a></p>
              <p className="font-semibold">Phone: <a href={`tel:${job.contactInfo.phone}`}>{job.contactInfo.phone}</a></p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Posted by: {job.postedBy.firstName} {job.postedBy.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
            </p>
          </div>
          <Button className="w-full">Apply Now</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

