import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Music } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-5xl border-2 border-opacity-50 border-primary">
        <CardHeader>
          <CardTitle className="text-5xl font-bold">Aaryan Singh</CardTitle>
          <CardDescription className="text-2xl">Full-stack developer and tech enthusiast</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg">
                Hey there! I&apos;m an 18-year-old CS undergrad with a passion for building and problem-solving. 
                My interests span from language design to web development to mechanical keyboards. 
                When i am not coding or working , you can find me learning about AI or geeking over tech products .
              </p>
              <div className="flex space-x-4">
                <Button asChild variant="outline" size="lg">
                  <Link href="/projects">Projects</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/Resume">Resume</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild variant="ghost" className="w-full justify-start text-lg">
                    <a href="https://github.com/asdfghjA1">
                      <Github className="mr-3 h-5 w-5" />
                      GitHub
                    </a>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start text-lg">
                    <a href="https://x.com/LiquidZooo">
                      <Twitter className="mr-3 h-5 w-5" />
                      X
                    </a>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start text-lg">
                    <a href="https://open.spotify.com/user/n6flft6og06273ld0v1hd9uk0?si=5f20106902e44a2b">
                      <Music className="mr-3 h-5 w-5" />
                      Spotify
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}




// https://open.spotify.com/user/n6flft6og06273ld0v1hd9uk0?si=5f20106902e44a2b