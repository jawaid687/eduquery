"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { FlashcardGenerator } from "@/components/features/study/flashcard-generator";
import { askQuestion, getDocument } from "@/lib/api-client";
import type { ChatMessage, Document } from "@/types";


export default function StudyPage() {

  const params = useParams();

  const documentId = params.documentId as string;


  const [document, setDocument] =
    useState<Document | null>(null);

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [loading, setLoading] =
    useState(false);


  const chatEndRef =
    useRef<HTMLDivElement | null>(null);



  useEffect(() => {

    if (!documentId) return;


    getDocument(documentId)
      .then(setDocument)
      .catch(() => {
        setDocument(null);
      });


  }, [documentId]);





  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);






  const handleAsk = async () => {

    if (!question.trim() || loading) return;


    const userText = question;


    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: userText,
      },
    ]);


    setQuestion("");

    setLoading(true);



    try {

      const response =
        await askQuestion(
          userText,
          documentId,
        );



      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.answer,
          citations: response.citations,
        },
      ]);



    } catch {


      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I could not generate an answer.",
        },
      ]);



    } finally {

      setLoading(false);

    }

  };






  return (

    <main className="min-h-screen bg-background p-6">


      <div className="mx-auto flex max-w-7xl flex-col gap-4">



        <header>

          <h1 className="text-2xl font-bold">

            {document?.filename ?? "Loading..."}

          </h1>



          {document && (

            <p className="text-sm text-muted-foreground">

              {document.page_count} pages

            </p>

          )}

        </header>






        <div className="grid h-[850px] grid-cols-2 gap-4">





          {/* PDF VIEWER */}

          <section className="overflow-hidden rounded-lg border">

            <iframe

              src={
                `http://localhost:8000/api/v1/documents/${documentId}/file`
              }

              className="h-full w-full"

              title="PDF Viewer"

            />

          </section>







          {/* CHAT + FLASHCARDS */}

          <section className="flex flex-col rounded-lg border">



            {/* CHAT AREA */}

            <div className="flex-1 space-y-4 overflow-y-auto p-4">



              {messages.length === 0 && (

                <p className="text-sm text-muted-foreground">

                  Ask anything about your lecture material.

                </p>

              )}






              {messages.map((message) => (

                <div

                  key={message.id}

                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[90%] rounded-lg bg-primary p-3 text-primary-foreground"
                      : "max-w-[90%] rounded-lg bg-muted p-3"
                  }

                >



                  <p className="text-sm font-semibold">

                    {message.role === "user"
                      ? "You"
                      : "EduQuery"}

                  </p>





                  <p className="mt-2 whitespace-pre-wrap text-sm">

                    {message.content}

                  </p>





                  {message.citations &&
                    message.citations.length > 0 && (

                    <div className="mt-3 border-t pt-2 text-xs">


                      <p className="font-semibold">

                        Sources

                      </p>



                      {message.citations.map(
                        (citation, index) => (

                          <p key={index}>

                            📄 {citation.filename}
                            {" — "}
                            Page {citation.page_number}

                          </p>

                        ),
                      )}


                    </div>

                  )}



                </div>

              ))}






              {loading && (

                <p className="text-sm text-muted-foreground">

                  Thinking...

                </p>

              )}





              <div ref={chatEndRef} />

            </div>








            {/* CHAT INPUT */}

            <div className="flex gap-2 border-t p-4">



              <input

                className="flex-1 rounded-md border px-3 py-2"

                placeholder="Ask about your lecture..."

                value={question}

                onChange={(e) =>
                  setQuestion(e.target.value)
                }

                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    handleAsk();

                  }

                }}

              />




              <button

                className="rounded-md bg-primary px-5 text-primary-foreground"

                onClick={handleAsk}

                disabled={loading}

              >

                {loading ? "..." : "Ask"}

              </button>



            </div>







            {/* FLASHCARD SECTION */}

            <FlashcardGenerator
              documentId={documentId}
            />



          </section>





        </div>





      </div>





    </main>

  );

}