"use client";
import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Feedback {
  id: string;
  username: string;
  rating: string;
}

const FeedbackCard: React.FC<Feedback> = ({ id, username, rating }) => {
  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-4 text-white">
      <h2 className="text-xl font-semibold">{username || "missing"}</h2>
      <p className="text-sm text-gray-400">Feedback ID: {id}</p>
      <p className="mt-2">Rating: <span className="text-yellow-400">{rating || "missing"}</span></p>
    </div>
  );
};

export default function JaskeePage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get("http://localhost:3000/pages/api/feedbacks");
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">All Feedbacks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedbacks.map((feedback) => (
          <FeedbackCard key={feedback.id} {...feedback} />
        ))}
      </div>
    </div>
  );
}
