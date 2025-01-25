'use client'
import React, { useState } from 'react';
import { FileText } from 'lucide-react';

// Interface for paper/PDF item
interface PdfItem {
  title: string;
  path: string;
}

// Sample PDF list (you'll replace this with your actual PDFs)
const papers: PdfItem[] = [
  {
    title: "Attention is all you need",
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
    title: "DeepSeek LLM: Scaling Open-Source Language Models with Longtermism",
    path: "/papers/deepseekr1.pdf",
  }
];

export default function PDFReader() {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(papers[0].path);
//   const [setExpandedItems] = useState<{[key: string]: boolean}>({});


  return (
    <div className="flex h-screen">
      {/* Sidebar Tree View */}
      <div className="w-1/4  p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Research Papers</h2>
        {papers.map((paper) => (
          <div key={paper.title} className="mb-2">
            <div 
              className={`flex items-center cursor-pointer p-2 rounded ${
                selectedPdf === paper.path 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'hover:bg-gray-200 hover:text-black'
              }`}
              onClick={() => setSelectedPdf(paper.path)}
            >
              <FileText className="mr-2 w-5 h-5" />
              <span className="flex-1 truncate">{paper.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Viewer */}
      <div className="w-3/4 p-4">
        {selectedPdf ? (
          <iframe 
            src={selectedPdf} 
            width="100%" 
            height="100%" 
            className="border rounded-lg shadow-md"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No PDF selected
          </div>
        )}
      </div>
    </div>
  );
}