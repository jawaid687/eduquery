"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Download } from "lucide-react";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";


pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;


interface PDFViewerProps {
  url: string;
  filename?: string;
}


export function PDFViewer({
  url,
  filename = "document.pdf",
}: PDFViewerProps) {

  const [pages, setPages] = useState(0);


  return (
    <div className="flex h-full flex-col">


      {/* TOP BAR */}

      <div className="flex items-center justify-end border-b p-2">

        <a
          href={url}
          download={filename}
          target="_blank"
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >

          <Download className="h-4 w-4" />

          Download

        </a>

      </div>



      {/* PDF AREA */}

      <div className="flex-1 overflow-y-auto p-4">


        <Document
          file={url}
          onLoadSuccess={(pdf) => {
            setPages(pdf.numPages);
          }}
          loading={
            <p className="text-sm text-muted-foreground">
              Loading PDF...
            </p>
          }
        >


          {Array.from(
            { length: pages },
            (_, index) => (

              <div
                key={index}
                className="mb-6 flex justify-center"
              >

                <Page
                  pageNumber={index + 1}
                  width={500}
                />

              </div>

            )
          )}


        </Document>


      </div>


    </div>
  );
}