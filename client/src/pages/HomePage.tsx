import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ChartPie } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <Layout>
      <div className="size-full flex flex-col gap-4 items-center justify-center">
        <h1 className="text-5xl font-notosans">
          Welcome to <Link to={"/"} className="font-libre text-blue-600">Hyro</Link>
        </h1>
        <p className="w-3/4 font-notosans text-center">
          Hyro is a comprehensive employee management and monitoring solution
          designed to streamline company operations. With features to track
          employee performance, manage tasks, and enhance team collaboration,
          Hyro empowers organizations to achieve efficiency and productivity.
          Built with a focus on simplicity and usability, Hyro offers a seamless
          experience for both managers and employees, ensuring smoother
          workflows and better decision-making.
        </p>
        <Link to={"/dashboard"}><Button><ChartPie/>Dashboard</Button></Link>
      </div>
    </Layout>
  );
};

export default HomePage;
