'use client'
import React, { useState } from "react"
import { ChevronRight, ChevronDown, FileText, ZoomIn, ZoomOut, ChevronLeft } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js`

// Interface for paper/PDF item
interface PdfItem {
  title: string
  path: string
}

// Sample PDF list (you'll replace this with your actual PDFs)
const papers: PdfItem[] = [
  {
    title: "Attention is all you need",
    path: "/papers/AIAYN.pdf",
  }
 
]

export default function PDFReader() {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(papers[0].path)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => Math.min(Math.max(1, prevPageNumber + offset), numPages || 1))
  }

  const zoomIn = () => setScale((prevScale) => Math.min(2, prevScale + 0.1))
  const zoomOut = () => setScale((prevScale) => Math.max(0.5, prevScale - 0.1))

  return (
    <div className="flex h-screen">
      {/* Sidebar Tree View */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Research Papers</h2>
        {papers.map((paper) => (
          <div key={paper.title} className="mb-2">
            <div
              className={`flex items-center cursor-pointer p-2 rounded ${
                selectedPdf === paper.path ? "bg-orange-100 text-orange-600" : "hover:bg-gray-200"
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
      <div className="w-3/4 p-4 flex flex-col">
        {selectedPdf ? (
          <>
            <div className="flex justify-between mb-4">
              <div>
                <button
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className="mr-2 p-2 bg-gray-200 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= (numPages || 1)}
                  className="p-2 bg-gray-200 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="ml-4">
                  Page {pageNumber} of {numPages}
                </span>
              </div>
              <div>
                <button onClick={zoomOut} className="mr-2 p-2 bg-gray-200 rounded">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button onClick={zoomIn} className="p-2 bg-gray-200 rounded">
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <Document file={selectedPdf} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
                <Page pageNumber={pageNumber} scale={scale} className="shadow-lg" />
              </Document>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">No PDF selected</div>
        )}
      </div>
    </div>
  )
}

