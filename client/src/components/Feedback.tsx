import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Feedback {
  _id: string;
  userId: string;
  hr: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  createdAt: Date;
}

const Feedback = ({ feedbacks }: { feedbacks: Feedback[] }) => {
  return feedbacks.length > 0 ? (
    <section className=" max-h-[555px] overflow-y-scroll space-y-5 custom-scrollbar">
      <h2 className="text-lg font-semibold sticky top-0 bg-white z-20 scroll-smooth py-3">My Feedbacks</h2>
      {feedbacks.map((feedbackItem) => (
        <Card key={feedbackItem._id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${feedbackItem.hr.firstName} ${feedbackItem.hr.lastName}`}
                />
                <AvatarFallback>
                  {feedbackItem.hr.firstName[0]}
                  {feedbackItem.hr.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="capitalize">
                {feedbackItem.hr.firstName} {feedbackItem.hr.lastName}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{feedbackItem.content}</p>
          </CardContent>
          <CardFooter>
            <span className="text-sm font-semibold text-muted-foreground">{new Date(feedbackItem.createdAt).toDateString()}</span>
          </CardFooter>
        </Card>
      ))}
    </section>
  ) : (
    <p className="text-xl text-center text-muted-foreground font-semibold">
      No feedbacks available
    </p>
  );
};

export default Feedback;
