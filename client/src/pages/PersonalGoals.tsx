import React, { useState, useEffect } from "react";
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
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const PersonalGoals = () => {
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedGoal, setEditedGoal] = useState<any>({});

  useEffect(() => {
    const fetchGoals = async () => {
      setIsGoalsLoading(true);
      try {
        const res = await fetch("/api/employee/all-goal");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch goals");
        }

        setGoals(data.personalGoals);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not load goals. Please try again.",
          variant: "destructive",
        });
      }finally{
        setIsGoalsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleEdit = (index: number, goal: any) => {
    setEditIndex(index);
    setEditedGoal({ ...goal });
  };

  const handleSave = async (goalId: string, index: number) => {
    try {
      setIsLoading(true);
  
      const response = await fetch(`/api/employee/edit-goal/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedGoal),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update goal");
      }
  
      const data = await response.json();
  
      setGoals((prevGoals) => {
        const updatedGoals = [...prevGoals];
        updatedGoals[index] = data.updatedGoal; // Replace the goal with the updated one
        return updatedGoals;
      });
  
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
  
      // Clear editing state
      setEditIndex(null);
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
      const response = await fetch(`/api/employee/delete-goal/${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }

      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: goalTitle, description: goalDescription, targetDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to add goal");
      }

      const data = await response.json();

      setGoals((prevGoals) => [data.newGoal, ...prevGoals]);

      toast({
        title: "Success",
        description: "Goal added successfully!",
      });

      setGoalTitle("");
      setGoalDescription("");
      setTargetDate("");
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
      <div className="grid grid-cols-8 gap-4">
        {/* Goals List */}
        <div className="col-span-3">
          <h2 className="text-center text-3xl font-semibold my-3">My Goals</h2>
          {isGoalsLoading ? (
            <div className="flex size-full items-center justify-center">
              <Loader className="mx-auto h-6 w-6 animate-spin" />
            </div>
          ) : goals.length > 0 ? (
            goals.map((goal, index) => (
              <Card key={goal._id || index} className="mb-4">
                <CardHeader>
                  {editIndex === index ? (
                    <>
                      <Input
                        value={editedGoal.title || ""}
                        onChange={(e) =>
                          setEditedGoal((prev: any) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="Goal Title"
                      />
                      <Input
                        value={editedGoal.description || ""}
                        onChange={(e) =>
                          setEditedGoal((prev: any) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Goal Description"
                      />
                      <Input
                        type="date"
                        value={editedGoal.targetDate?.split("T")[0] || ""}
                        onChange={(e) =>
                          setEditedGoal((prev: any) => ({ ...prev, targetDate: e.target.value }))
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
                    <Button onClick={() => handleSave(goal._id, index)} className="bg-green-500">
                      Save
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => handleEdit(index, goal)}>
                      Edit
                    </Button>
                  )}
                  <Button
                    className="bg-red-500"
                    onClick={() => handleDelete(goal._id, index)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center">You have no personal goals</p>
          )}
        </div>

        {/* Add Goal Form */}
        <div className="col-span-5">
        <h2 className="text-center text-3xl font-semibold my-3">Add A New Goal</h2>
          <Card className="w-full">
            <CardHeader></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="goalTitle">Goal Title</Label>
                    <Input
                      id="goalTitle"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder="Your goal title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goalDescription">Goal Description</Label>
                    <Input
                      id="goalDescription"
                      value={goalDescription}
                      onChange={(e) => setGoalDescription(e.target.value)}
                      placeholder="Goal description"
                    />
                  </div>
                  <div>
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
