import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const ROLE_OPTIONS = ["employee", "hr", "admin"];

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  position: string;
  joiningDate: string;
  annualCTC: number;
  monthlyInHand: number;
  housingAllowance?: number;
  transportAllowance?: number;
  mealAllowance?: number;
  performanceBonus?: number;
  yearEndBonus?: number;
  tax?: number;
  healthInsurance?: number;
  providentFund?: number;
}

function RoleDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select name="role" id="role" value={value} onChange={onChange}>
      {ROLE_OPTIONS.map((role) => (
        <option key={role} value={role}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </option>
      ))}
    </select>
  );
}

export default function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "employee",
    position: "",
    joiningDate: "",
    annualCTC: 0,
    monthlyInHand: 0,
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setIsLoading(true);
      try {
        const [employeeRes, ctcRes] = await Promise.all([
          fetch(`/api/hr/employee/${id}`),
          fetch(`/api/employee/ctc/${id}`),
        ]);

        if (!employeeRes.ok || !ctcRes.ok)
          throw new Error("Failed to fetch data");

        const employeeData = await employeeRes.json();
        const ctcData = await ctcRes.json();

        // Convert joiningDate to YYYY-MM-DD format if it’s not already
        const formattedJoiningDate = new Date(employeeData.joiningDate)
          .toISOString()
          .split("T")[0];

        setFormData({
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          role: employeeData.role,
          position: employeeData.position || "",
          joiningDate: formattedJoiningDate || "",
          annualCTC: ctcData.ctc.annualCTC,
          monthlyInHand: ctcData.ctc.monthlyInHand,
          ...ctcData.ctc.otherComponents?.allowances,
          ...ctcData.ctc.otherComponents?.bonuses,
          ...ctcData.ctc.otherComponents?.deductions,
        });
      } catch (error) {
        console.error("Error fetching employee data:", error);
        toast({
          title: "Error",
          description: "Failed to load employee data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Allowance") ||
        name.includes("Bonus") ||
        ["tax", "healthInsurance", "providentFund"].includes(name)
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const validateForm = (): boolean => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.role ||
      !formData.position ||
      !formData.joiningDate
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
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
      const response = await fetch(`/api/hr/employee/edit?userId=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update employee data");

      toast({
        title: "Success",
        description: "Employee data updated successfully",
      });
      navigate(`/employee/${id}`);
    } catch (error) {
      console.error("Error updating employee data:", error);
      toast({
        title: "Error",
        description: "Failed to update employee data. Please try again.",
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
    <Layout>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Edit Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fields with new position and joiningDate */}
                {[
                  { label: "First Name", name: "firstName", required: true },
                  { label: "Last Name", name: "lastName", required: true },
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    required: true,
                  },
                  { label: "Role", name: "role", component: RoleDropdown },
                  { label: "Position", name: "position", required: true },
                  {
                    label: "Joining Date",
                    name: "joiningDate",
                    type: "date",
                    required: true,
                  },
                  {
                    label: "Annual CTC",
                    name: "annualCTC",
                    type: "number",
                    required: true,
                  },
                  {
                    label: "Monthly In-Hand",
                    name: "monthlyInHand",
                    type: "number",
                    required: true,
                  },
                  {
                    label: "Housing Allowance",
                    name: "housingAllowance",
                    type: "number",
                  },
                  {
                    label: "Transport Allowance",
                    name: "transportAllowance",
                    type: "number",
                  },
                  {
                    label: "Meal Allowance",
                    name: "mealAllowance",
                    type: "number",
                  },
                  {
                    label: "Performance Bonus",
                    name: "performanceBonus",
                    type: "number",
                  },
                  {
                    label: "Year-End Bonus",
                    name: "yearEndBonus",
                    type: "number",
                  },
                  { label: "Tax", name: "tax", type: "number" },
                  {
                    label: "Health Insurance",
                    name: "healthInsurance",
                    type: "number",
                  },
                  {
                    label: "Provident Fund",
                    name: "providentFund",
                    type: "number",
                  },
                ].map(
                  ({
                    label,
                    name,
                    type = "text",
                    required = false,
                    component: Component,
                  }) => (
                    <div key={name} className="space-y-2">
                      <Label htmlFor={name}>{label}</Label>
                      {Component ? (
                        <Component
                          value={formData[name as keyof EmployeeFormData] as string || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <Input
                          id={name}
                          name={name}
                          type={type}
                          value={formData[name as keyof EmployeeFormData] || ""}
                          onChange={handleInputChange}
                          required={required}
                        />
                      )}
                    </div>
                  )
                )}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Employee"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
