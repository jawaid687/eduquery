"use client";

import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { deleteDocument } from "@/lib/api-client";
import type { Document } from "@/types";


interface DocumentListProps {
  documents: Document[];
  onDeleted?: (id: string) => void;
}


const statusConfig = {
  ready: {
    label: "Ready",
    icon: CheckCircle2,
    className:
      "text-green-700 bg-green-50 border-green-200",
  },

  processing: {
    label: "Processing",
    icon: Loader2,
    className:
      "text-amber-700 bg-amber-50 border-amber-200",
  },

  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "text-muted-foreground bg-muted border-border",
  },

  failed: {
    label: "Failed",
    icon: XCircle,
    className:
      "text-red-700 bg-red-50 border-red-200",
  },
};


export function DocumentList({
  documents,
  onDeleted,
}: DocumentListProps) {


  const handleDelete = async (
    id: string
  ) => {

    const confirmDelete = window.confirm(
      "Delete this document?"
    );


    if (!confirmDelete) {
      return;
    }


    try {

      await deleteDocument(id);

      onDeleted?.(id);


    } catch (error) {

      console.error(error);

      alert(
        "Failed to delete document."
      );

    }
  };



  if (documents.length === 0) {

    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        No documents uploaded yet.
      </div>
    );

  }



  return (

    <ul className="flex flex-col gap-2">

      {documents.map((doc)=>{


        const config =
          statusConfig[doc.status];


        const Icon =
          config.icon;



        const item = (

          <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:border-primary/40">


            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">

              <FileText className="h-5 w-5 text-primary"/>

            </div>



            <div className="flex-1 min-w-0">

              <p className="truncate font-medium">
                {doc.filename}
              </p>


              <p className="text-xs text-muted-foreground">
                {doc.page_count > 0
                  ? `${doc.page_count} pages`
                  : "--"}
              </p>

            </div>




            <Badge
              variant="outline"
              className={config.className}
            >

              <Icon className="mr-1 h-3 w-3"/>

              {config.label}

            </Badge>





            <button
              onClick={(e)=>{

                e.preventDefault();
                e.stopPropagation();

                handleDelete(doc.id);

              }}

              className="text-red-600 hover:text-red-800"
            >

              <Trash2 className="h-4 w-4"/>

            </button>


          </div>

        );



        return (

          <li key={doc.id}>

            {doc.status === "ready" ? (

              <Link href={`/study/${doc.id}`}>
                {item}
              </Link>

            ) : (

              item

            )}

          </li>

        );


      })}


    </ul>

  );

}