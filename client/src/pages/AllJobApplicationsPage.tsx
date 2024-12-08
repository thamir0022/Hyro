import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";


interface Job {
  _id: string;
  title: string;
}

interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobId: Job;
  willingToRelocate: boolean;
  expectedSalaryRange: {
    min: number;
    max: number;
  };
  createdAt: string;
}

const AllJobApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/hr/get-all-job-applications");
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        const data = await response.json();
        setApplications(data.applications);
      } catch (err) {
        setError("Failed to load applications. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Loader className="size-8 animate-spin"/>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500 mt-8">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-center text-3xl font-semibold my-3">
          All Job Applications
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Card key={application._id}>
              <CardHeader>
                <CardTitle className="">{`${application.firstName} ${application.lastName}`}</CardTitle>
                <span className="font-semibold text-blue-600">{application.jobId.title}</span>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Email: {application.email}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Phone: {application.phone}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Expected Salary: $
                  {application.expectedSalaryRange.min.toLocaleString()} - $
                  {application.expectedSalaryRange.max.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Willing to Relocate:{" "}
                  {application.willingToRelocate ? "Yes" : "No"}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Application Date:{" "}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
                <Link to={`/job-application/${application._id}`}>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AllJobApplications;
