import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const ROLE_OPTIONS = ["hr", "admin"];

interface HRFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
}

function RoleDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select
      name="role"
      id="role"
      value={value}
      onChange={onChange}
      className="form-select"
    >
      {ROLE_OPTIONS.map((role) => (
        <option key={role} value={role}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </option>
      ))}
    </select>
  );
}

export default function HREdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<HRFormData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "hr",
    password: "",
  });

  useEffect(() => {
    const fetchHRData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/hr/${id}`);
        if (!response.ok) throw new Error("Failed to fetch HR data");

        const hrData = await response.json();
        setFormData({
          firstName: hrData.firstName,
          lastName: hrData.lastName,
          email: hrData.email,
          role: hrData.role,
          password: hrData.password,
        });
      } catch (error) {
        console.error("Error fetching HR data:", error);
        toast({
          title: "Error",
          description: "Failed to load HR data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHRData();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/hr/edit?userId=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        toast({
          title: "Failed to update HR data. Please try again.",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "HR data updated successfully",
      });
      navigate(`/hr/${id}`);
    } catch (error) {
      console.error("Error updating HR data:", error);
      toast({
        title: "Error",
        description: "Failed to update HR data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit HR Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  onChange={handleInputChange}
                  placeholder="●●●●●●●●"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <RoleDropdown
                  value={formData.role}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update HR"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
