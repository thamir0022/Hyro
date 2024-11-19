"use client";

import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  joiningDate: string; // Changed to string for easier date handling
  password: string;
  annualCTC: number;
  monthlyInHand: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  performanceBonus: number;
  yearEndBonus: number;
  tax: number;
  healthInsurance: number;
  providentFund: number;
}

export default function AddEmployee() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    joiningDate: "", // Initialize as empty string
    password: "",
    annualCTC: 0,
    monthlyInHand: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    mealAllowance: 0,
    performanceBonus: 0,
    yearEndBonus: 0,
    tax: 0,
    healthInsurance: 0,
    providentFund: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "joiningDate"
          ? value // Set as-is for date
          : ["firstName", "lastName", "email", "position", "password"].includes(
              name
            )
          ? value
          : parseFloat(value) || 0,
    }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.position
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.annualCTC <= 0 || formData.monthlyInHand <= 0) {
      toast({
        title: "Validation Error",
        description: "CTC and Monthly In-Hand salary must be greater than 0.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/hr/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add new employee");

      const newEmployee = await response.json();
      toast({
        title: "Success",
        description: "New employee added successfully",
      });
      setTimeout(() => {
        navigate(`/employee/${newEmployee.user.id}`);
      }, 3000);
    } catch (error) {
      console.error("Error adding new employee:", error);
      toast({
        title: "Error",
        description: "Failed to add new employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h2 className="mb-4 text-center text-3xl font-semibold">Add New Employee</h2>
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(formData).map((field) => (
                  <div key={field} className="space-y-2">
                    <Label className="capitalize" htmlFor={field}>
                      {field.replace(/([A-Z])/g, " $1")}
                    </Label>
                    <Input
                      id={field}
                      name={field}
                      type={
                        field === "password"
                          ? "password"
                          : field === "joiningDate"
                          ? "date"
                          : typeof formData[field as keyof EmployeeFormData] ===
                            "number"
                          ? "number"
                          : "text"
                      }
                      value={
                        field === "joiningDate"
                          ? formData.joiningDate.toString().split("T")[0] // Format date as YYYY-MM-DD
                          : formData[field as keyof EmployeeFormData]
                      }
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Employee"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
