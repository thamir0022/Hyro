import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
          <Link to={"/"} className="font-libre text-2xl md:text-3xl font-bold text-gray-800">
            Hyro
          </Link>
          <div className="text-base md:text-lg text-gray-600">
            © {new Date().getFullYear()} Hyro. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
