"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, GraduationCap, Mail, MapPin, Phone, Github, Globe } from "lucide-react"
import { useEffect, useState } from "react";

export default function Resume() {
  const [typedText, setTypedText] = useState("");
  const fullText = "AARYAN SINGH";

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < 12) {
        setTypedText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="container mx-auto p-8 bg-background text-foreground font-sans h-screen overflow-hidden pt-24">
      <Card className="w-full max-w-5xl mx-auto shadow-lg h-full flex flex-col">
        <CardHeader className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-6 space-y-0">
          <Avatar className="w-40 h-40">
            <AvatarImage alt="Resume photo" src="/placeholder.svg?height=160&width=160" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-4xl font-bold">
              <span className="inline-block">{typedText}</span>
              <span className="inline-block animate-blink">|</span>
            </h1>
            <p className="text-xl text-muted-foreground">&lt;Full Stack Developer /&gt;</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-1 px-3">
                <MapPin className="w-4 h-4" />
                Bangalore, India
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-1 px-3">
                <Mail className="w-4 h-4" />
                aaryan@whiteye.in
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-1 px-3">
                <Phone className="w-4 h-4" />
                +91 7578999112
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-1 px-3">
                <a href="https://github.com/asdfghjA1" className="flex items-center gap-2">
                  <Github className="w-4 h-4" />asdfghjA1
                </a>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-1 px-3">
                <Globe className="w-4 h-4" />
                aaryan.whiteye.in
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 flex-grow overflow-y-auto scrollbar-hide">
        <section>
            <h2 className="text-2xl font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {['JavaScript', 'React', 'Node.js', 'MongoDB', 'Docker', 'Prisma', 'Git', 'Ruby on Rails', 'Cloud Technologies'].map((skill) => (
                <Badge key={skill} variant="secondary" className="text-lg py-1 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Summary</h2>
            <p className="text-lg text-muted-foreground">
              Passionate Full Stack Developer experienced in building scalable web applications and automation tools. Skilled in JavaScript, React, Node.js, and cloud technologies.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Work Experience</h2>
            <div className="space-y-6">
              <Card className="shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="w-5 h-5" />
                    Web Developer
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">FNBC | Feb 2023 - Aug 2024</p>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-lg">
                    <li>Managed and developed solutions for 20+ clients</li>
                    <li>Engineered custom backend logging and tracking services</li>
                    <li>Implemented AI-Service-Bots on client websites</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="w-5 h-5" />
                    Technical Intern
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">NGO Synergy | May 2022 - Aug 2022</p>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-lg">
                    <li>Utilized workflow software for research project management</li>
                    <li>Conducted data categorization and cataloging</li>
                    <li>Applied advanced analytics techniques</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Education</h2>
            <div className="space-y-6">
              <Card className="shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <GraduationCap className="w-5 h-5" />
                    B.Tech in Computer Science and Engineering
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">MS Ramaiah Institute of Technology | 2023-Present</p>
                </CardHeader>
              </Card>
              <Card className="shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <GraduationCap className="w-5 h-5" />
                    ISC (Class XII)
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">The Assam Valley School | 2021 - 2023 | Score: 92%</p>
                </CardHeader>
              </Card>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}