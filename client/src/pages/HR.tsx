"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

interface HRData {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  createdAt: Date;
}

export default function HRPage() {
  const [hr, setHr] = useState<HRData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/hr/${id}`);

        if (!response.ok) throw new Error("Failed to fetch employee data");

        const hrData = await response.json();
        console.log(hrData);
        setHr(hrData);
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!hr) {
    return <div>Failed to load employee data.</div>;
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/delete-hr/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      // Handle unsuccessful response
      if (!response.ok) {
        toast({
          title: data.message || "An error occurred.",
          variant: "destructive",
        });
        return;
      }

      // Handle successful response
      toast({
        title: data.message || "Employee deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Delete request failed:", error);
      toast({
        title: "Failed to delete employee.",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HR Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${hr.firstName} ${hr.lastName}`}
            />
            <AvatarFallback>
              {hr.firstName[0]}
              {hr.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">
              {hr.firstName} {hr.lastName}
            </h2>
            <p className="text-muted-foreground">{hr.role}</p>
            <p className="text-muted-foreground">{hr.email}</p>
            <p className="font-semibold">
              Joined On:{" "}
              {hr.createdAt
                ? new Date(hr.createdAt).toDateString()
                : "January 2 Tuesday 2024"}
            </p>
          </div>
          <div className="flex ml-auto gap-3">
            <Link to={`/hr/edit/${hr._id}`} className="ml-auto">
              <Button>Edit</Button>
            </Link>
            <Dialog>
              <DialogTrigger>
                <Button variant={"destructive"}>Delete</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold capitalize">
                      {hr.firstName} {hr.lastName}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <p className="text-center px-2 py-4">
                    This action cannot be undone. This will permanently delete
                    the account and remove the data from our servers.
                  </p>
                  <div className="flex justify-evenly">
                    <DialogClose>
                      <Button>Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={() => handleDelete()}
                      variant={"destructive"}
                    >
                      Delete
                    </Button>
                  </div>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
