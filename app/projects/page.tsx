"use client"
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const projects = [
  {
    title: "Public News Net",
    description: "This is a test description for Public News Net. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUPoKQ22LfSLNq2AmIU4iUns5FRcIEtYD05g&s",
    link: "https://github.com/asdfghjA1/BOBO",
    offline: true,
    offlineMessage: "This project is offline and has been discontinued."
  },
  {
    title: "AI Image Generator",
    description: "Test description for AI Image Generator. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "/generated-image.png",
    link: "https://img.whiteye.in/"
  },
  {
    title: "Youtube Automation Bot",
    description: "Random test text for Youtube Automation Bot. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://lh3.googleusercontent.com/3zkP2SYe7yYoKKe47bsNe44yTgb4Ukh__rBbwXwgkjNRe4PykGG409ozBxzxkrubV7zHKjfxq6y9ShogWtMBMPyB3jiNps91LoNH8A=s500",
    link: "https://github.com/your-username/youtube-automation-bot"
  }
];

export default function Projects() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">My Projects</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-lg font-medium">
                {project.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="relative aspect-[16/9] mb-4 flex-shrink-0">
                <Image
                  src={project.image}
                  alt={project.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
              <p className="text-base text-muted-foreground mb-4">
                {project.description}
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              {project.offline ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full">View Project</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Project Offline</AlertDialogTitle>
                      <AlertDialogDescription>
                        {project.offlineMessage}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Link href={project.link}>Continue to GitHub</Link>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button asChild className="w-full">
                  <Link href={project.link}>View Project</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}