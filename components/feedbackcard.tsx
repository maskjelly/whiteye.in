"use client";

import * as React from "react";
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
import { useState } from "react";
import axios from "axios";

export default function CardWithForm() {
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/pages/api/feedbacks/", {
        username,
        rating
      });
      // Handle success if needed
    } catch (error) {
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[699px] h-[400px]">
      <CardHeader>
        <CardTitle>Any Feedback?</CardTitle>
        <CardDescription>
          This is a test to check admin control and backend tests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                onChange={(e) => setUsername(e.target.value)}
                id="name"
                placeholder="Name?"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Rate</Label>
              <Input
                onChange={(e) => setRating(e.target.value)}
                id="framework"
                placeholder="Any feedback that you would like to provide?"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          type="button"
          className="mt-8 w-full text-white bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
        >
          {isLoading ? "Updating..." : "Update"}
        </button>
      </CardFooter>
    </Card>
  );
}