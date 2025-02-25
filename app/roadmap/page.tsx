// pages/Roadmap.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Roadmap = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <header className="text-center mb-8 md:mb-12 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          A Roadmap for Advancing Robotics Simulation
        </h1>
        <p className="text-md md:text-lg text-gray-600 mt-2 italic">
          Leveraging Genesis Physics Engine and RoboGen for Startup Innovation in Embodied AI
        </p>
      </header>

      {/* Abstract */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">Abstract</CardTitle>
        </CardHeader>
        <CardContent className="columns-1 md:columns-2 gap-6">
          <p className="text-gray-700 break-words">
            <span className="font-bold text-gray-900">This report details</span> a strategic roadmap for our startup, harnessing the Genesis physics engine and RoboGen to address the scarcity of real-world robotics data for early-generation robots. By simulating robot behavior in virtual environments and automating task generation, we extract high-fidelity synthetic data for AI training. Integrating Genesis’s ultra-fast simulation with RoboGen’s generative capabilities, our cloud-based pipeline emphasizes scalability, security, and efficiency, reducing costs and accelerating development.
          </p>
        </CardContent>
      </Card>

      {/* Introduction */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">1. Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">1.1 Define the Problem</h3>
          <p className="text-gray-700 mb-4">
            <strong>Need:</strong> Limited real-world data hampers robotics, especially for early-generation robots where prototypes are scarce or costly.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Solution:</strong> We simulate robot behavior using Genesis, extracting data like leg movement and sensor readings, enhanced by RoboGen’s task automation.
          </p>
          <p className="text-gray-700">
            <strong>Benefits:</strong> Genesis’s 43 million frames per second on an RTX 4090 cuts simulation time, while RoboGen streamlines data generation, lowering costs and boosting development speed (<a href="https://genesis-embodied-ai.github.io/" className="text-blue-600 underline">Genesis Docs</a>).
          </p>
        </CardContent>
      </Card>

      {/* Background */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">2. Background and Context</CardTitle>
        </CardHeader>
        <CardContent className="columns-1 md:columns-2 gap-6">
          <p className="text-gray-700 break-words">
            Genesis, an open-source physics engine, is tailored for robotics and Embodied AI, integrating solvers (rigid body, MPM, SPH) for simulations up to 80 times faster than Isaac Gym. Its photo-realistic rendering and Pythonic API lower research barriers, excelling in synthetic data generation for early-stage robots (<a href="https://www.datacamp.com/tutorial/genesis-physics-engine-tutorial" className="text-blue-600 underline">DataCamp</a>). RoboGen, a generative agent within Genesis, automates skill proposal and mastery, making it a cornerstone of our approach (<a href="https://github.com/Genesis-Embodied-AI/RoboGen" className="text-blue-600 underline">RoboGen GitHub</a>).
          </p>
        </CardContent>
      </Card>

      {/* System Overview */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">3. System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">3.1 Architecture and Components</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Core Components:</strong> Genesis Simulation Engine, RoboGen Task Generator, Data Capture, Client UI</li>
            <li><strong>Data Flow:</strong> Clients upload models and specify tasks; RoboGen generates scenarios; processed data is delivered.</li>
            <li><strong>Scalability:</strong> Cloud infrastructure for concurrent simulations.</li>
            <li><strong>Security:</strong> Robust protection for client data and early-stage designs.</li>
          </ul>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">3.2 Testing Strategy</h3>
          <p className="text-gray-700">
            Data is tested across environments to refine behavior, with an internal filter for quality assurance, leveraging RoboGen’s diverse outputs.
          </p>
        </CardContent>
      </Card>

      {/* Implementation */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">4. Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">4.1 Setup</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Install Genesis and verify compatibility (<a href="https://pypi.org/project/genesis-world/" className="text-blue-600 underline">PyPI</a>)</li>
          </ul>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">4.2 Integrate Client Robot Models</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Start with a default model; scale to client-provided models.</li>
            <li>Calibrate physics properties (<a href="https://genesis-embodied-ai.github.io/" className="text-blue-600 underline">Docs</a>).</li>
            <li>Updates via <a href="https://github.com/Genesis-Embodied-AI/RoboGen" className="text-blue-600 underline">GitHub</a> and <a href="https://robogen-ai.github.io/" className="text-blue-600 underline">RoboGen Paper</a>.</li>
          </ul>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">4.3 Define Simulation Environments</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Scenarios: legged robots, manipulators; use <code>gs.morphs.Terrain</code> or custom maps.</li>
            <li>Configure gravity, time step, conditions.</li>
          </ul>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">4.4 Test and Validate</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Test diverse models and scenarios.</li>
            <li>Validate with real data or expert review (<a href="https://www.datacamp.com/tutorial/genesis-physics-engine-tutorial" className="text-blue-600 underline">DataCamp</a>).</li>
          </ul>
        </CardContent>
      </Card>

      {/* RoboGen Technical Section */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">5. RoboGen: Automating Task Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">5.1 What is RoboGen?</h3>
          <p className="text-gray-700 mb-4">
            RoboGen, a generative robotic agent within Genesis, automates the propose-generate-learn cycle. It proposes tasks, generates environments with objects and assets, and learns policies via reinforcement learning or trajectory optimization (<a href="https://robogen-ai.github.io/" className="text-blue-600 underline">RoboGen Paper</a>).
          </p>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">5.2 Integration in Our Pipeline</h3>
          <p className="text-gray-700 mb-4">
            Clients specify tasks in natural language; RoboGen interprets them, generates simulation environments, and produces training data, minimizing manual effort (<a href="https://github.com/Genesis-Embodied-AI/RoboGen" className="text-blue-600 underline">GitHub</a>).
          </p>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">5.3 Benefits</h3>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Automation:</strong> Reduces human intervention in task and data generation.</li>
            <li><strong>Diversity:</strong> Generates varied skill demonstrations.</li>
            <li><strong>Efficiency:</strong> Leverages Genesis’s speed for rapid training (<a href="https://siliconangle.com/2024/12/20/researchers-open-source-genesis-simulation-platform-training-robots/" className="text-blue-600 underline">SiliconANGLE</a>).</li>
          </ul>
        </CardContent>
      </Card>

      {/* Comparative Analysis */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">6. Comparative Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base text-gray-700 border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Feature</th>
                  <th className="border p-2">Genesis</th>
                  <th className="border p-2">RoboGen</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2"><strong>Function</strong></td>
                  <td className="border p-2">Ultra-fast simulation</td>
                  <td className="border p-2">Task/skill generation</td>
                </tr>
                <tr>
                  <td className="border p-2"><strong>Speed</strong></td>
                  <td className="border p-2">80x faster than Isaac Gym</td>
                  <td className="border p-2">Leverages Genesis</td>
                </tr>
                <tr>
                  <td className="border p-2"><strong>Use Case</strong></td>
                  <td className="border p-2">Robotics, Embodied AI</td>
                  <td className="border p-2">Propose-generate-learn</td>
                </tr>
                <tr>
                  <td className="border p-2"><strong>Client Interaction</strong></td>
                  <td className="border p-2">Model upload, scenarios</td>
                  <td className="border p-2">Natural language tasks</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 mt-4">
            Genesis outperforms traditional platforms like Mujoco with its speed and versatility (<a href="https://medium.com/data-science-in-your-pocket/genesis-physics-ai-engine-for-robotic-simulation-b67176c45a7d" className="text-blue-600 underline">Medium</a>).
          </p>
        </CardContent>
      </Card>

      {/* Future Directions */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">7. Future Directions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            We aim to expand RoboGen for soft-body manipulation and enhance Genesis’s differentiability for tactile simulations. Challenges include maintaining data quality and security (<a href="https://www.notebookcheck.net/10-years-of-training-in-one-hour-thanks-to-Genesis-The-Matrix-becomes-reality-for-robots.935352.0.html" className="text-blue-600 underline">NotebookCheck</a>).
          </p>
        </CardContent>
      </Card>

      {/* References */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">8. References</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-decimal pl-6 text-gray-700 text-sm md:text-base">
            <li><a href="https://genesis-embodied-ai.github.io/" className="text-blue-600 underline">Genesis Docs</a></li>
            <li><a href="https://www.datacamp.com/tutorial/genesis-physics-engine-tutorial" className="text-blue-600 underline">DataCamp Tutorial</a></li>
            <li><a href="https://medium.com/data-science-in-your-pocket/genesis-physics-ai-engine-for-robotic-simulation-b67176c45a7d" className="text-blue-600 underline">Medium</a></li>
            <li><a href="https://www.marktechpost.com/2024/12/19/meet-genesis-an-open-source-physics-ai-engine-redefining-robotics-with-ultra-fast-simulations-and-generative-4d-worlds/" className="text-blue-600 underline">MarkTechPost</a></li>
            <li><a href="https://digialps.com/genesis-a-universal-physics-engine-to-build-smarter-robots-through-better-simulation/" className="text-blue-600 underline">Digialps</a></li>
            <li><a href="https://github.com/Genesis-Embodied-AI/RoboGen" className="text-blue-600 underline">RoboGen GitHub</a></li>
            <li><a href="https://robogen-ai.github.io/" className="text-blue-600 underline">RoboGen Paper</a></li>
            <li><a href="https://siliconangle.com/2024/12/20/researchers-open-source-genesis-simulation-platform-training-robots/" className="text-blue-600 underline">SiliconANGLE</a></li>
            <li><a href="https://www.notebookcheck.net/10-years-of-training-in-one-hour-thanks-to-Genesis-The-Matrix-becomes-reality-for-robots.935352.0.html" className="text-blue-600 underline">NotebookCheck</a></li>
            <li><a href="https://arxiv.org/html/2311.01455v3" className="text-blue-600 underline">RoboGen ArXiv</a></li>
          </ul>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center text-gray-500 mt-8 text-sm md:text-base border-t-2 border-gray-300 pt-4">
        <p>Last Updated: February 25, 2025</p>
      </footer>
    </div>
  );
};

export default Roadmap;