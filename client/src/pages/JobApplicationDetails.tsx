import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Education {
  degree: string;
  institutionName: string;
  graduationYear: number;
  _id: string;
}

interface WorkExperience {
  role: string;
  companyName: string;
  startDate: string;
  endDate: string;
  _id: string;
}

interface Job {
  _id: string;
  title: string;
  applicationDeadline: string;
}

interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedInProfile: string;
  portfolio: string;
  jobId: Job;
  education: Education[];
  workExperience: WorkExperience[];
  willingToRelocate: boolean;
  expectedSalaryRange: {
    min: number;
    max: number;
  };
  createdAt: string;
  updatedAt: string;
}

const JobApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const response = await fetch(`/api/hr/get-job-application/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch application details");
        }
        const data = await response.json();
        setApplication(data.application);
      } catch (err) {
        setError("Failed to load application details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error || !application) {
    return (
      <Layout>
        <div className="text-center text-red-500 mt-8">
          {error || "Application not found"}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/all-job-applications" className="mb-4 inline-block">
          <Button variant="outline">← Back to All Applications</Button>
        </Link>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              {application.firstName} {application.lastName}
            </CardTitle>
            <Link className="w-fit" to={`/apply-job/${application.jobId._id}`}>
              <Badge
                variant="secondary"
                className="hover:scale-105 transition-all  text-blue-600 text-lg"
              >
                {application.jobId.title}
              </Badge>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Contact Information
                </h2>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    className="text-blue-600"
                    href={`mailto:${application.email}`}
                  >
                    {application.email}
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a
                    className="text-blue-600"
                    href={`tel:${application.phone}`}
                  >
                    {application.phone}
                  </a>
                </p>
                <p>
                  <strong>LinkedIn:</strong>{" "}
                  <a
                    href={application.linkedInProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {application.linkedInProfile}
                  </a>
                </p>
                <p>
                  <strong>Portfolio:</strong>{" "}
                  <a
                    href={application.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {application.portfolio}
                  </a>
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Application Details
                </h2>
                <p>
                  <strong>Willing to Relocate:</strong>{" "}
                  {application.willingToRelocate ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Expected Salary Range:</strong> $
                  {application.expectedSalaryRange.min.toLocaleString()} - $
                  {application.expectedSalaryRange.max.toLocaleString()}
                </p>
                <p>
                  <strong>Application Date:</strong>{" "}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Application Deadline:</strong>{" "}
                  {new Date(
                    application.jobId.applicationDeadline
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Education</h2>
              {application.education.map((edu) => (
                <div key={edu._id} className="mb-4">
                  <p>
                    <strong>{edu.degree}</strong>
                  </p>
                  <p>{edu.institutionName}</p>
                  <p>Graduation Year: {edu.graduationYear}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Work Experience</h2>
              {application.workExperience.map((exp) => (
                <div key={exp._id} className="mb-4">
                  <p>
                    <strong>{exp.role}</strong> at {exp.companyName}
                  </p>
                  <p>
                    {new Date(exp.startDate).toLocaleDateString()} -{" "}
                    {new Date(exp.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default JobApplicationDetails;
