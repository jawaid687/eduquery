"use client";


import { useEffect, useState } from "react";

import { UploadDropzone } from "@/components/features/documents/upload-dropzone";
import { DocumentList } from "@/components/features/documents/document-list";

import { listDocuments } from "@/lib/api-client";

import type { Document } from "@/types";



export default function DashboardPage() {


    const [
        documents,
        setDocuments
    ] = useState<Document[]>([]);



    const [
        error,
        setError
    ] = useState<string | null>(null);



    const loadDocuments = async () => {

        try {

            const data =
                await listDocuments();


            setDocuments(
                data.documents
            );


            setError(null);


        } catch {

            setError(
                "Could not load documents."
            );

        }

    };



    useEffect(() => {

        loadDocuments();

    }, []);




    const handleUploaded = (
        document: Document
    ) => {


        setDocuments((current) => [
            document,
            ...current,
        ]);



        const interval =
            setInterval(async () => {


                const data =
                    await listDocuments();



                setDocuments(
                    data.documents
                );



                const updated =
                    data.documents.find(
                        (d) =>
                            d.id === document.id
                    );



                if (
                    updated?.status === "ready" ||
                    updated?.status === "failed"
                ) {

                    clearInterval(interval);

                }


            }, 3000);


    };




    const handleDeleted = (
        id: string
    ) => {

        setDocuments((docs) =>
            docs.filter(
                (doc) => doc.id !== id
            )
        );

    };




    return (

        <main className="min-h-screen bg-background px-6 py-10">


            <div className="mx-auto max-w-5xl">


                <header>

                    <h1 className="text-3xl font-bold">
                        EduQuery
                    </h1>


                    <p className="mt-2 text-muted-foreground">
                        Upload your lecture materials and prepare smarter.
                    </p>


                </header>




                <section className="mt-8">


                    <h2 className="mb-3 text-xl font-semibold">
                        Upload Document
                    </h2>


                    <UploadDropzone
                        onUploaded={handleUploaded}
                    />


                </section>





                <section className="mt-8">


                    <h2 className="mb-3 text-xl font-semibold">
                        Your Documents
                    </h2>




                    {error ? (

                        <p className="text-red-600">
                            {error}
                        </p>

                    ) : (


                        <DocumentList

                            documents={documents}

                            onDeleted={handleDeleted}

                        />


                    )}



                </section>



            </div>


        </main>

    );


}