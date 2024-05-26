import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center">
        <Link to="/signin">
          <button className="m-4 px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-md hover:bg-blue-100">
            Sign In
          </button>
        </Link>
        <Link to="/signup">
          <button className="m-4 px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-md hover:bg-blue-100">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
