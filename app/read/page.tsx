"use client";

import { useState, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { FileText } from "lucide-react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Link from "next/link";

interface PdfItem {
  title: string;
  path: string;
}

// Sample PDF list
const papers: PdfItem[] = [
  {
    title: "Attention is All You Need",
    path: "/papers/AIAYN.pdf",
  },
  {
    title: "GPT-3: Language Models are Few-Shot Learners",
    path: "/papers/GPT3paper.pdf",
  },
  {
    title: "LLaMA: Open and Efficient Foundation Language Models",
    path: "/papers/llama3report.pdf",
  },
  {
    title: "DeepSeek LLM: Scaling Open-Source Language Models",
    path: "/papers/deepseekr1.pdf",
  },
];

export default function PDFReader() {
  const [workerUrl, setWorkerUrl] = useState("");
  const [selectedPdf, setSelectedPdf] = useState<string>(papers[0].path);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    setWorkerUrl("/pdf.worker.min.js");
  }, []);

  if (!workerUrl) return null;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black">
      {/* Sidebar */}
      <div className="w-full lg:w-72 border-b lg:border-r border-zinc-800 bg-black/50 backdrop-blur-sm">
        <div className="p-4">
          <div>
            <Link href={"/"}>

            <button className="hover:text-orange-500 px-14 rounded-sm border hover:border-orange-500 py-4 ml-4">
              {" "}
              &larr; go back
            </button>
</Link>
          </div>
          <h2 className="text-xl font-bold mb-4 mt-3 text-zinc-200">
            Research Papers
          </h2>
          <div className="space-y-2">
            {papers.map((paper) => (
              <div key={paper.title}>
                <button
                  onClick={() => setSelectedPdf(paper.path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                    ${
                      selectedPdf === paper.path
                        ? "bg-orange-500/10 text-orange-500"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-left">{paper.title}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 h-full bg-zinc-900">
        <Worker workerUrl={workerUrl}>
          <div className="h-full">
            <Viewer
              fileUrl={selectedPdf}
              plugins={[defaultLayoutPluginInstance]}
              theme={{
                theme: "dark",
              }}
            />
          </div>
        </Worker>
      </div>
    </div>
  );
}
