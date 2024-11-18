import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const PersonalGoals = () => {
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);

  const [editIndex, setEditIndex] = useState<number | null>(null); // Track which card is being edited
  const [editedGoal, setEditedGoal] = useState<any>({});

  const handleEdit = (index: number, goal: any) => {
    setEditIndex(index);
    setEditedGoal(goal); // Pre-fill the input fields with the existing goal data
  };

  const handleSave = async (goalId: string, index: number) => {
    try {
      setIsLoading(true);
  
      const response = await fetch(`/api/employee/edit-goal/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editedGoal.title,
          description: editedGoal.description,
          targetDate: editedGoal.targetDate,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update goal");
      }
  
      const data = await response.json();
  
      // Update the goals state
      setGoals((prevGoals) =>
        prevGoals.map((goal, i) => (i === index ? { ...goal, ...data.updatedGoal } : goal))
      );
  
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
  
      setEditIndex(null); // Exit edit mode
      setEditedGoal({});
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (goalId: string, index: number) => {
    try {
      // Send DELETE request to the backend
      const response = await fetch(`/api/employee/delete-goal/${goalId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete goal");
      }
  
      // Show success toast
      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });
  
      // Remove the deleted goal from the state
      setGoals((prevGoals) => prevGoals.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const getMyGoals = async () => {
      try {
        const res = await fetch("/api/employee/all-goal");
        const data = await res.json();
        if (!res.ok) {
          toast({
            title: "Failed to load goals",
            description: data.message || "Try again later",
            variant: "destructive",
          });
          return;
        }
        setGoals(data.personalGoals);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not load goals. Please try again.",
          variant: "destructive",
        });
      }
    };
    getMyGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goalTitle || !goalDescription || !targetDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/employee/add-goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: goalTitle,
          description: goalDescription,
          targetDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add goal");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "Goal added successfully!",
      });

      // Reset form
      setGoalTitle("");
      setGoalDescription("");
      setTargetDate("");

      // Update goals list
      setGoals((prevGoals) => [...prevGoals, data.newGoal]);
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <Layout>
      <h1 className="mb-5">My Goals</h1>
      <div className="flex justify-around gap-3">
        <div className="">
          <form>
          {goals && goals.length > 0 ? (
            goals.map((goal: any, index: number) => (
              <Card key={goal.id || index} className="w-[450px]">
                <CardHeader>
                  {editIndex === index ? (
                    <>
                      <Input
                        value={editedGoal.title || ""}
                        onChange={(e) =>
                          setEditedGoal({ ...editedGoal, title: e.target.value })
                        }
                        placeholder="Goal Title"
                      />
                      <Input
                        value={editedGoal.description || ""}
                        onChange={(e) =>
                          setEditedGoal({
                            ...editedGoal,
                            description: e.target.value,
                          })
                        }
                        placeholder="Goal Description"
                      />
                      <Input
                        type="date"
                        value={editedGoal.targetDate?.split("T")[0] || ""}
                        onChange={(e) =>
                          setEditedGoal({
                            ...editedGoal,
                            targetDate: e.target.value,
                          })
                        }
                      />
                    </>
                  ) : (
                    <>
                      <CardTitle>{goal.title}</CardTitle>
                      <CardDescription>
                        <p>{goal.description}</p>
                        <p>{new Date(goal.targetDate).toDateString()}</p>
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                <CardFooter className="flex justify-between">
                  {editIndex === index ? (
                    <Button
                    type="button"
                      onClick={() => handleSave(goal._Id,index)}
                      className="bg-green-500"
                    >
                      Update
                    </Button>
                    
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(index, goal)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button className="bg-red-500" onClick={() => handleDelete(goal._id, index)} >Delete</Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p>You have no personal goals</p>
          )}
          </form>
        </div>
        <div className="mt-6">
          <Card className="w-[750px]">
            <CardHeader>
              <CardTitle>Add Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Goal Title</Label>
                    <Input
                      id="name"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder="Your goal title"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="description">Goal Description</Label>
                    <Input
                      id="description"
                      value={goalDescription}
                      onChange={(e) => setGoalDescription(e.target.value)}
                      type="text"
                      placeholder="Goal description"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      type="date"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Goal"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PersonalGoals;
