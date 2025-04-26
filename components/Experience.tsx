'use client'
const Experience = () => {
  return (
    <section className="space-y-20">
      <div className="space-y-12">
        <div>
          <h2 className="text-3xl tracking-widest uppercase text-gray-400">Experience</h2>
          <div className="divider mt-8"></div>
        </div>
        
        <div className="space-y-16">
          <div>
            <h3 className="text-3xl tracking-wide mb-4">Rice University Security Audit
            </h3>
            <p className="text-xl text-gray-400 mb-6">Bounty Hacker</p>
            <p className="text-lg text-gray-400 leading-relaxed">
            Engineered (under bounty) hack against rice.edu's systems and gained access to every inch of their database | reported and audited their website for  for further security access and flaws
            </p>
          </div>
          
          <div>
            <h3 className="text-3xl tracking-wide mb-4">2x YCombinator Dev</h3>
            <p className="text-xl text-gray-400 mb-6">O1Visa & Fridaymail</p>
            <p className="text-lg text-gray-400 leading-relaxed">
             Maintained directory and worked on backend infra mostly . Indexing and making backend as fast as possible .<br/><br/> Built in-house email ranking engine tagging mails with AI and lifetime context for LLM's 

            </p>
          </div>
          
          <div>
            <h3 className="text-3xl tracking-wide mb-4">FnBC</h3>
            <p className="text-xl text-gray-400 mb-6">Full-Stack Engineer</p>
            <p className="text-lg text-gray-400 leading-relaxed">
              Built real-time presence and communication systems using t3 stack, 
              bridging digital spaces with human connection.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div>
          <h2 className="text-3xl tracking-widest uppercase text-gray-400">Current Focus</h2>
          <div className="divider mt-8"></div>
        </div>
        <div className="space-y-12">
          <div>
            <h3 className="text-3xl tracking-wide mb-4">FigureOutName</h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Developing advanced data processing systems for robotic applications.
            </p>
          </div>
          
          <div>
            <h3 className="text-3xl tracking-wide mb-4">Research</h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Exploring neural networks and machine learning architectures.
            </p>
          </div>
        </div>      </div>
    </section>
  );
};

export default Experience;