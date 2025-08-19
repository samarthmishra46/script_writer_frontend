import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 text-center px-6">
      {/* Icon */}
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg mb-6">
        <AlertTriangle className="w-10 h-10 text-white" />
      </div>

      {/* Heading */}
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        404 – Page Not Found
      </h1>

      {/* Subtext */}
      <p className="text-gray-700 text-lg max-w-lg mb-8">
        Oops! The page you’re looking for doesn’t exist or has been moved.  
        But don’t worry — let’s get you back on track.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back Home
        </Link>

        <Link
          to="/aboutus"
          className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl border border-purple-200 shadow-md hover:shadow-xl transition-transform duration-200 hover:scale-105"
        >
          Learn About Us
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
