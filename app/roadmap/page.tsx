'use client'
import React, { useState, useEffect } from 'react';

const Roadmap = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Persist theme preference in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    localStorage.setItem('theme', !isDarkTheme ? 'dark' : 'light');
  };

  return (
    <div
      className={`h-screen w-screen overflow-y-auto font-['Terminus',_monospace] text-base leading-relaxed transition-colors duration-300 ${
        isDarkTheme
          ? 'bg-black text-[#00FF00]'
          : 'bg-[#F5F5F5] text-[#000000]'
      }`}
    >
      {/* Header Section - News Article Style */}
      <header className="w-full p-4 sm:p-6 md:p-8 bg-inherit border-b border-[#333333]">
        <div className="max-w-3xl mx-auto">
          <h1
            className={`text-xl sm:text-2xl md:text-3xl uppercase tracking-wider font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            A ROADMAP FOR ADVANCING ROBOTICS SIMULATION
          </h1>
          <p className="text-sm sm:text-base md:text-lg italic mb-4">
            Leveraging Genesis Physics Engine and RoboGen for Startup Innovation
          </p>
          <div className="flex justify-between items-center text-sm sm:text-base">
            <span>Published: February 25, 2025</span>
            <button
              onClick={toggleTheme}
              className={`px-2 py-1 border border-[#333333] uppercase hover:bg-[#333333] hover:text-[#00FF00] transition-colors ${
                isDarkTheme ? 'bg-black text-[#00FF00]' : 'bg-[#F5F5F5] text-[#000000]'
              }`}
            >
              {isDarkTheme ? 'LIGHT' : 'DARK'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Single Column */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Abstract */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            ABSTRACT
          </h2>
          <p className="text-sm sm:text-base">
            THIS REPORT OUTLINES A STRATEGIC ROADMAP FOR OUR STARTUP, UTILIZING THE GENESIS PHYSICS ENGINE AND ROBOGEN TO ADDRESS THE SCARCITY OF REAL-WORLD ROBOTICS DATA FOR EARLY-GENERATION ROBOTS. BY SIMULATING ROBOT BEHAVIOR IN VIRTUAL ENVIRONMENTS AND AUTOMATING TASK GENERATION, WE PRODUCE HIGH-FIDELITY SYNTHETIC DATA FOR AI TRAINING. OUR CLOUD-BASED PIPELINE INTEGRATES GENESIS’S ULTRA-FAST SIMULATION WITH ROBOGEN’S GENERATIVE CAPABILITIES, PRIORITIZING SCALABILITY, SECURITY, AND EFFICIENCY TO REDUCE COSTS AND ACCELERATE DEVELOPMENT.
          </p>
        </section>

        {/* Introduction */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            1. INTRODUCTION
          </h2>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            1.1 DEFINE THE PROBLEM
          </h3>
          <p className="text-sm sm:text-base mb-4">
            NEED: LIMITED REAL-WORLD DATA RESTRICTS ROBOTICS DEVELOPMENT, PARTICULARLY FOR EARLY-GENERATION ROBOTS WHERE PROTOTYPES ARE SCARCE OR EXPENSIVE.
          </p>
          <p className="text-sm sm:text-base mb-4">
            SOLUTION: WE USE GENESIS TO SIMULATE ROBOT BEHAVIOR, CAPTURING DATA SUCH AS LEG MOVEMENT AND SENSOR READINGS, ENHANCED BY ROBOGEN’S TASK AUTOMATION.
          </p>
          <p className="text-sm sm:text-base">
            BENEFITS: GENESIS DELIVERS 43 MILLION FRAMES PER SECOND ON AN RTX 4090, REDUCING SIMULATION TIME, WHILE ROBOGEN STREAMLINES DATA GENERATION (<a href="https://genesis-embodied-ai.github.io/" className="underline">GENESIS DOCS</a>).
          </p>
        </section>

        {/* Background */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            2. BACKGROUND AND CONTEXT
          </h2>
          <p className="text-sm sm:text-base">
            GENESIS, AN OPEN-SOURCE PHYSICS ENGINE DESIGNED FOR ROBOTICS AND EMBODIED AI, INTEGRATES SOLVERS (RIGID BODY, MPM, SPH) FOR SIMULATIONS UP TO 80 TIMES FASTER THAN ISAAC GYM. ITS PHOTO-REALISTIC RENDERING AND PYTHONIC API LOWER ENTRY BARRIERS, EXCELLING IN SYNTHETIC DATA GENERATION FOR EARLY-STAGE ROBOTS (<a href="https://www.datacamp.com/tutorial/genesis-physics-engine-tutorial" className="underline">DATACAMP</a>). ROBOGEN, A GENERATIVE AGENT WITHIN GENESIS, AUTOMATES SKILL PROPOSAL AND MASTERY, FORMING A KEY PILLAR OF OUR APPROACH (<a href="https://github.com/Genesis-Embodied-AI/RoboGen" className="underline">ROBOGEN GITHUB</a>).
          </p>
        </section>

        {/* System Overview */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            3. SYSTEM OVERVIEW
          </h2>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            3.1 ARCHITECTURE AND COMPONENTS
          </h3>
          <ul className="list-[square] pl-6 mb-4 text-sm sm:text-base">
            <li>CORE COMPONENTS: GENESIS SIMULATION ENGINE, ROBOGEN TASK GENERATOR, DATA CAPTURE, CLIENT UI</li>
            <li>DATA FLOW: CLIENTS UPLOAD MODELS AND TASKS; ROBOGEN GENERATES SCENARIOS; PROCESSED DATA IS RETURNED.</li>
            <li>SCALABILITY: CLOUD-BASED INFRASTRUCTURE SUPPORTS CONCURRENT SIMULATIONS.</li>
            <li>SECURITY: ROBUST SAFEGUARDS PROTECT CLIENT DATA AND DESIGNS.</li>
          </ul>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            3.2 TESTING STRATEGY
          </h3>
          <p className="text-sm sm:text-base">
            DATA IS VALIDATED ACROSS DIVERSE ENVIRONMENTS, WITH AN INTERNAL FILTER ENSURING QUALITY, LEVERAGING ROBOGEN’S VARIED OUTPUTS.
          </p>
        </section>

        {/* Implementation */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            4. IMPLEMENTATION
          </h2>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            4.1 SETUP
          </h3>
          <ul className="list-[square] pl-6 mb-4 text-sm sm:text-base">
            <li>INSTALL GENESIS AND CONFIRM COMPATIBILITY (<a href="https://pypi.org/project/genesis-world/" className="underline">PYPI</a>)</li>
          </ul>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            4.2 INTEGRATE CLIENT ROBOT MODELS
          </h3>
          <ul className="list-[square] pl-6 mb-4 text-sm sm:text-base">
            <li>BEGIN WITH A DEFAULT MODEL; EXPAND TO CLIENT-PROVIDED MODELS.</li>
            <li>CALIBRATE PHYSICS PROPERTIES (<a href="https://genesis-embodied-ai.github.io/" className="underline">DOCS</a>).</li>
            <li>UPDATES VIA <a href="https://github.com/Genesis-Embodied-AI/RoboGen" className="underline">GITHUB</a> AND <a href="https://robogen-ai.github.io/" className="underline">ROBOGEN PAPER</a>.</li>
          </ul>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            4.3 DEFINE SIMULATION ENVIRONMENTS
          </h3>
          <ul className="list-[square] pl-6 mb-4 text-sm sm:text-base">
            <li>SCENARIOS: LEGGED ROBOTS, MANIPULATORS; USE `GS.MORPHS.TERRAIN` OR CUSTOM MAPS.</li>
            <li>CONFIGURE GRAVITY, TIME STEP, AND CONDITIONS.</li>
          </ul>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            4.4 TEST AND VALIDATE
          </h3>
          <ul className="list-[square] pl-6 text-sm sm:text-base">
            <li>TEST ACROSS DIVERSE MODELS AND SCENARIOS.</li>
            <li>VALIDATE WITH REAL DATA OR EXPERT REVIEW (<a href="https://www.datacamp.com/tutorial/genesis-physics-engine-tutorial" className="underline">DATACAMP</a>).</li>
          </ul>
        </section>

        {/* RoboGen Technical Section */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            5. ROBOGEN: AUTOMATING TASK GENERATION
          </h2>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            5.1 WHAT IS ROBOGEN?
          </h3>
          <p className="text-sm sm:text-base mb-4">
            ROBOGEN, A GENERATIVE AGENT WITHIN GENESIS, AUTOMATES THE PROPOSE-GENERATE-LEARN CYCLE. IT PROPOSES TASKS, CREATES ENVIRONMENTS WITH OBJECTS AND ASSETS, AND LEARNS POLICIES VIA REINFORCEMENT LEARNING OR TRAJECTORY OPTIMIZATION (<a href="https://robogen-ai.github.io/" className="underline">ROBOGEN PAPER</a>).
          </p>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            5.2 INTEGRATION IN OUR PIPELINE
          </h3>
          <p className="text-sm sm:text-base mb-4">
            CLIENTS DEFINE TASKS IN NATURAL LANGUAGE; ROBOGEN INTERPRETS THEM, GENERATES SIMULATION ENVIRONMENTS, AND PRODUCES TRAINING DATA, REDUCING MANUAL EFFORT (<a href="https://github.com/Genesis-Embodied-AI/RoboGen" className="underline">GITHUB</a>).
          </p>
          <h3
            className={`text-sm sm:text-base md:text-lg uppercase mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            5.3 BENEFITS
          </h3>
          <ul className="list-[square] pl-6 text-sm sm:text-base">
            <li>AUTOMATION: MINIMIZES HUMAN INVOLVEMENT IN TASK AND DATA GENERATION.</li>
            <li>DIVERSITY: PRODUCES VARIED SKILL DEMONSTRATIONS.</li>
            <li>EFFICIENCY: UTILIZES GENESIS’S SPEED FOR RAPID TRAINING (<a href="https://siliconangle.com/2024/12/20/researchers-open-source-genesis-simulation-platform-training-robots/" className="underline">SILICONANGLE</a>).</li>
          </ul>
        </section>

        {/* Comparative Analysis */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            6. COMPARATIVE ANALYSIS
          </h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm sm:text-base border border-[#333333]">
              <thead>
                <tr className="bg-[#333333]">
                  <th className="border border-[#333333] p-2 text-left text-[#00FF00]">FEATURE</th>
                  <th className="border border-[#333333] p-2 text-left text-[#00FF00]">GENESIS</th>
                  <th className="border border-[#333333] p-2 text-left text-[#00FF00]">ROBOGEN</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#333333] p-2">FUNCTION</td>
                  <td className="border border-[#333333] p-2">ULTRA-FAST SIMULATION</td>
                  <td className="border border-[#333333] p-2">TASK/SKILL GENERATION</td>
                </tr>
                <tr>
                  <td className="border border-[#333333] p-2">SPEED</td>
                  <td className="border border-[#333333] p-2">80X FASTER THAN ISAAC GYM</td>
                  <td className="border border-[#333333] p-2">LEVERAGES GENESIS</td>
                </tr>
                <tr>
                  <td className="border border-[#333333] p-2">USE CASE</td>
                  <td className="border border-[#333333] p-2">ROBOTICS, EMBODIED AI</td>
                  <td className="border border-[#333333] p-2">PROPOSE-GENERATE-LEARN</td>
                </tr>
                <tr>
                  <td className="border border-[#333333] p-2">CLIENT INTERACTION</td>
                  <td className="border border-[#333333] p-2">MODEL UPLOAD, SCENARIOS</td>
                  <td className="border border-[#333333] p-2">NATURAL LANGUAGE TASKS</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm sm:text-base">
            GENESIS SURPASSES PLATFORMS LIKE MUJOCO IN SPEED AND VERSATILITY (<a href="https://medium.com/data-science-in-your-pocket/genesis-physics-ai-engine-for-robotic-simulation-b67176c45a7d" className="underline">MEDIUM</a>).
          </p>
        </section>

        {/* Future Directions */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            7. FUTURE DIRECTIONS
          </h2>
          <p className="text-sm sm:text-base">
            WE PLAN TO ENHANCE ROBOGEN FOR SOFT-BODY MANIPULATION AND IMPROVE GENESIS’S DIFFERENTIABILITY FOR TACTILE SIMULATIONS. CHALLENGES INCLUDE ENSURING DATA QUALITY AND SECURITY (<a href="https://www.notebookcheck.net/10-years-of-training-in-one-hour-thanks-to-Genesis-The-Matrix-becomes-reality-for-robots.935352.0.html" className="underline">NOTEBOOKCHECK</a>).
          </p>
        </section>

        {/* References */}
        <section className="mb-8">
          <h2
            className={`text-base sm:text-lg md:text-xl uppercase font-bold mb-2 ${
              isDarkTheme ? 'text-[#00FF00]' : 'text-[#000000]'
            }`}
          >
            8. REFERENCES
          </h2>
          <ul className="list-decimal pl-6 text-sm sm:text-base">
            <li><a href="https://genesis-embodied-ai.github.io/" className="underline">GENESIS DOCS</a></li>
            <li><a href="https://www.datacamp.com/tutorial/genesis-physics-engine-tutorial" className="underline">DATACAMP TUTORIAL</a></li>
            <li><a href="https://medium.com/data-science-in-your-pocket/genesis-physics-ai-engine-for-robotic-simulation-b67176c45a7d" className="underline">MEDIUM</a></li>
            <li><a href="https://www.marktechpost.com/2024/12/19/meet-genesis-an-open-source-physics-ai-engine-redefining-robotics-with-ultra-fast-simulations-and-generative-4d-worlds/" className="underline">MARKTECHPOST</a></li>
            <li><a href="https://digialps.com/genesis-a-universal-physics-engine-to-build-smarter-robots-through-better-simulation/" className="underline">DIGIALPS</a></li>
            <li><a href="https://github.com/Genesis-Embodied-AI/RoboGen" className="underline">ROBOGEN GITHUB</a></li>
            <li><a href="https://robogen-ai.github.io/" className="underline">ROBOGEN PAPER</a></li>
            <li><a href="https://siliconangle.com/2024/12/20/researchers-open-source-genesis-simulation-platform-training-robots/" className="underline">SILICONANGLE</a></li>
            <li><a href="https://www.notebookcheck.net/10-years-of-training-in-one-hour-thanks-to-Genesis-The-Matrix-becomes-reality-for-robots.935352.0.html" className="underline">NOTEBOOKCHECK</a></li>
            <li><a href="https://arxiv.org/html/2311.01455v3" className="underline">ROBOGEN ARXIV</a></li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="text-center mt-8 border-t border-[#333333] pt-4 text-sm sm:text-base">
          <p>LAST UPDATED: FEBRUARY 25, 2025</p>
        </footer>
      </main>
    </div>
  );
};

export default Roadmap;