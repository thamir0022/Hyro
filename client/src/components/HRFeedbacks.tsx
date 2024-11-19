import { toast } from "@/hooks/use-toast";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface Feedbacks {
  _id: string;
  userId: string;
  hr: {
    firstName: string;
    lastName: string;
  };
  content: string;
  createdAt: Date;
}

const HRFeedbacks = ({ user }: { user: { name: string; id: string } }) => {
  const [feedbacks, setFeedbacks] = useState<Feedbacks[]>([]);
  const [hrFeedback, setHrfeedback] = useState<string>("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(`/api/employee/feedbacks?userId=${user.id}`);
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: "Failed to fetch employee feedback",
            description: data.message || "Please try again",
          });
          return;
        }

        setFeedbacks(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFeedbacks();
  }, [user]);


  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault();
    if(hrFeedback.length < 5){
      toast({
        title: "Feedback is too short",
        variant: "destructive"
      })
      return;
    }

    setHrfeedback("");

    try {
      const res = await fetch("/api/hr/feedback", {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({content: hrFeedback, userId: user.id})
      });

      const data = await res.json();

      if(!res.ok){
        toast({
          title: "Failed to submit feedback",
          description: data.message || "Please try again",
          variant: "destructive"
        })
        return;
      }

      toast({
        title: "Feedback submitted",
        description: data.message || "",
      });

      setFeedbacks((prev) => [data.feedback, ...prev]);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section className="w-full grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-center text-xl font-semibold">
          {user.name}'s Feedbacks
        </h2>
        {feedbacks.length > 0 ? (
          feedbacks.map(({ _id, content, createdAt, hr }) => (
            <Card key={_id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${hr.firstName} ${hr.lastName}`}
                    />
                    <AvatarFallback>
                      {hr.firstName[0]}
                      {hr.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="capitalize">
                    {hr.firstName} {hr.lastName}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{content}</p>
              </CardContent>
              <CardFooter>
                <span className="text-sm font-semibold text-muted-foreground">
                  {new Date(createdAt).toDateString()}
                </span>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-center text-lg font-semibold text-muted-foreground">
            {user.name} have no feedbacks
          </p>
        )}
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <h2 className="text-center text-xl font-semibold">
          Write a feedback to {user.name}
        </h2>
        <Textarea
          className="min-h-20 max-h-44"
          placeholder="Write your feedback here..."
          value={hrFeedback}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setHrfeedback(e.target.value)
          }
          required
        />
        <span className="text-xs font-semibold text-muted-foreground">{200 - hrFeedback.length } charecters remaining</span>
        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={() => setHrfeedback("")}>Clear</Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </section>
  );
};

export default HRFeedbacks;
