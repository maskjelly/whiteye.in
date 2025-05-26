export default function App() {
  return (
    <>
      <div className="min-h-screen bg-[#f8f8f8] text-[#333333] font-mono text-sm leading-relaxed">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Terminal Header */}
          <div className="mb-8 border-b border-[#cccccc] pb-4">
            <div className="text-[#666666] text-xs mb-2">
              Last login: Mon Dec 16 14:23:45 on ttys000
            </div>
            <div className="text-[#0066cc]">
              user@macbook-pro ~ % cat welcome.portfolio
            </div>
          </div>

          {/* Email-style Header */}
          <div className="mb-8 space-y-1">
            <div>
              Mon Dec 16 14:23:45 +0000 2024
              <br />
              From: Aryan {"<aaryan@whiteye.in>"}
            </div>
            <div>To: Whoever tf are you {"<hello@world.com>"}</div>
            <div>Subject: i guess whatever i know about me</div>
            <div>Organization [currently] : None </div>
            <div className="border-b border-[#cccccc] pb-2"></div>
          </div>

          {/* Main Content as Email Body */}
          <div className="space-y-6">
            <div>
              <div className="mb-4">Dear Internet,</div>
              <div className="mb-4">
                This is a digital piece of my footprint || to showcase and
                introduce myself to you and what i have done and like to do ,
                this is not meant to be taken as resume , but also to be taken
                as resume casue i have never made one
                {" <"}so this provides major insignts into what i am . {">"}
              </div>
              <div className="mb-4">
                Hi , i am 19 ~~ My plan right now is to be great . I am not a
                crypto bro but i love the concept of agreed concenus and how it
                cannot be controlled and be corroupted for someone's emotional
                outrage . Yes , everything here is out of context
              </div>
            </div>

            {/* Work Experience as Email Thread */}
            <div className="border-l-2 border-[#cccccc] pl-4 space-y-6">
              <div>
                <div className="text-[#666666] text-xs mb-2">
                  Date: Mon, 16 Dec 2024 14:25:33 -0800 From:
                  work-history@yourname.com
                </div>
                <div className="mb-2">Subject: Re: SIDE ACTION</div>
                <div className="border-b border-[#cccccc] pb-2 mb-4"></div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[#cc6600]">
                      {">"} Hacked RICE.EDU at 17{" "}
                      {"{casually sent them the audit after i did that}"}
                    </div>
                    <div className="text-[#cc6600]">
                      {">"} SQL Breach and DATABASE DUMP
                    </div>
                    <div className="ml-2">
                      None of this was done with malicious intent , this was
                      pure test that i was performing when i learning about
                      security , i tried doing it for RICE and stumbled on the
                      fact that there was a flaw , i check and there it was , i
                      dumped their duplicated database and sent them proof and
                      whole audit and how to fix it .
                    </div>
                  </div>

                  <div>
                    <div className="text-[#cc6600]">
                      {">"} O1Visa - [Aliens of Extraordinary Abilities] 
                    </div>
                    <div className="text-[#cc6600]">
                      {">"}Backend Engineer 
                    </div>
                    <div className="ml-2">
                      Worked on database design and user onboarding flow , make users authentication and managed B2B relations in backend .
                      {"My time here was short but got to work on soo much "}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#cc6600]">
                      {">"} AI EMAIL CLIENT {"YC23 companie ~wentDown"} (Jun 2019 - Feb 2021)
                    </div>
                    <div className="text-[#cc6600]">
                      {">"} Software Engineer
                    </div>
                    <div className="ml-2">
                      Worked on making an AI Native email client for businesses and B2B customers . Made AI auto tagging system and indexing whole users emails for AI search and automation .
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects as Forwarded Email */}
            <div className="border-l-2 border-[#cccccc] pl-4">
              <div className="text-[#666666] text-xs mb-2">
                Date: Mon, 16 Dec 2024 14:27:15 -0800 From:
                projects@yourname.com
              </div>
              <div className="mb-2">
                Subject: Fwd:  Currently working on and IDEAS 
              </div>
              <div className="border-b border-[#cccccc] pb-2 mb-4"></div>

              <div className="space-y-4">
                <div>
                  <div className="text-[#0066cc]">
                    {">"} Security Layer for AI generated code 
                  </div>
                  <div className="text-[#666666]">
                    {">"} Creator and Maintainer | CodeClot {"<github.com/apps/codeclot>"}
                  </div>
                  <div className="ml-2">
                    Open-source productivity tools powered by AI. Used by
                    50,000+ developers worldwide. Featured on Hacker News front
                    page. Weekly downloads: 10K+. Active community of
                    contributors.
                  </div>
                </div>

                <div>
                  <div className="text-[#0066cc]">{">"} startup-toolkit</div>
                  <div className="text-[#666666]">
                    {">"} Creator | Product Hunt: #2 Product of the Day
                  </div>
                  <div className="ml-2">
                    Collection of templates and tools for early-stage startups.
                    Helped 200+ founders launch their MVPs faster. Includes
                    pitch deck templates, financial models, and legal docs.
                  </div>
                </div>

                <div>
                  <div className="text-[#0066cc]">{">"} minimal-cms</div>
                  <div className="text-[#666666]">
                    {">"} Creator | NPM: 1K+ weekly downloads
                  </div>
                  <div className="ml-2">
                    Lightweight headless CMS built with modern web technologies.
                    Zero-config setup. Used by agencies and freelancers for
                    client projects. MIT licensed.
                  </div>
                </div>
              </div>
            </div>

            {/* Blog as Email Thread */}
            <div className="border-l-2 border-[#cccccc] pl-4">
              <div className="text-[#666666] text-xs mb-2">
                Date: Mon, 16 Dec 2024 14:29:42 -0800 From: blog@yourname.com
              </div>
              <div className="mb-2">
                Subject: Re: recent writings and thoughts
              </div>
              <div className="border-b border-[#cccccc] pb-2 mb-4"></div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="text-[#9933cc]">
                    {">"} Building a Startup in 2024: Lessons Learned
                  </div>
                  <div className="text-[#666666]">Dec 15, 2024</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[#9933cc]">
                    {">"} The Future of AI in Productivity Tools
                  </div>
                  <div className="text-[#666666]">Nov 28, 2024</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[#9933cc]">
                    {">"} How to Raise Your First Seed Round
                  </div>
                  <div className="text-[#666666]">Oct 12, 2024</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-[#9933cc]">
                    {">"} From Engineer to Founder: My Journey
                  </div>
                  <div className="text-[#666666]">Sep 5, 2024</div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-4 border-t border-[#cccccc]">
              <div className="mb-4">
                It would be great if we could connect. I am currently available
                for:
              </div>
              <div className="ml-4 space-y-1">
                <div>{">"} Investor meetings and partnership discussions</div>
                <div>{">"} Technical advisory roles</div>
                <div>{">"} Speaking engagements and podcast interviews</div>
                <div>{">"} Open source collaborations</div>
              </div>
            </div>

            <div className="mt-6">
              <div>Yours sincerely,</div>
              <div className="mt-2">Your Name {"<your.email@domain.com>"}</div>
              <div className="text-[#666666] text-xs mt-4">
                ... followed by contact information and social links
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 pt-4 border-t border-[#cccccc]">
              <div className="text-[#666666] text-xs mb-2">
                The next day, I had responses waiting in my inbox:
              </div>
              <div className="space-y-1 text-[#0066cc]">
                <div>{">"} email: your.email@domain.com</div>
                <div>{">"} twitter: @yourhandle</div>
                <div>{">"} github: github.com/yourusername</div>
                <div>{">"} linkedin: linkedin.com/in/yourname</div>
                <div>{">"} calendar: cal.com/yourname</div>
              </div>
            </div>

            {/* Terminal Prompt */}
            <div className="mt-8 pt-4">
              <div className="text-[#0066cc]">user@macbook-pro ~ % █</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
