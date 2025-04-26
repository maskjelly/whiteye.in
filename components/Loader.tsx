import React from 'react';

const Loader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="bg-gray-900/50 backdrop-blur-md rounded-lg shadow-lg p-6 animate-shimmer"
        >
          <div className="space-y-4">
            <div className="h-6 bg-gray-800 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded-md"></div>
            <div className="h-4 bg-gray-800 rounded-md w-1/2"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-10 bg-gray-700 rounded-md"></div>
              <div className="flex space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                <div className="w-6 h-6 rounded-full bg-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loader;