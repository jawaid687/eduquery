"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import {
  askQuestion,
  getDocument,
} from "@/lib/api-client";

import {
  FlashcardGenerator,
} from "@/components/features/study/flashcard-generator";

import {
  QuizGenerator,
} from "@/components/features/study/quiz-generator";

import type {
  ChatMessage,
  Document,
} from "@/types";


type Tab =
  | "pdf"
  | "chat"
  | "flashcards"
  | "quiz";


export default function StudyPage() {


  const params = useParams();

  const documentId =
    params.documentId as string;



  const [activeTab,setActiveTab] =
    useState<Tab>("pdf");


  const [document,setDocument] =
    useState<Document | null>(null);


  const [question,setQuestion] =
    useState("");


  const [messages,setMessages] =
    useState<ChatMessage[]>([]);


  const [loading,setLoading] =
    useState(false);



  const chatEndRef =
    useRef<HTMLDivElement | null>(null);



  useEffect(()=>{

    if(!documentId) return;


    getDocument(documentId)
      .then(setDocument)
      .catch(()=>setDocument(null));


  },[documentId]);





  useEffect(()=>{

    chatEndRef.current?.scrollIntoView({
      behavior:"smooth",
    });

  },[messages]);





  const handleAsk = async()=>{


    if(!question.trim() || loading)
      return;



    const text = question;


    setMessages(prev=>[
      ...prev,
      {
        id:crypto.randomUUID(),
        role:"user",
        content:text,
      },
    ]);



    setQuestion("");

    setLoading(true);



    try{


      const response =
        await askQuestion(
          text,
          documentId
        );


      setMessages(prev=>[
        ...prev,
        {
          id:crypto.randomUUID(),
          role:"assistant",
          content:response.answer,
          citations:response.citations,
        },
      ]);



    }catch{


      setMessages(prev=>[
        ...prev,
        {
          id:crypto.randomUUID(),
          role:"assistant",
          content:
          "Sorry, I could not answer.",
        },
      ]);


    }
    finally{

      setLoading(false);

    }

  };





  const tabs = [
    {
      id:"pdf",
      label:"📄 PDF",
    },
    {
      id:"chat",
      label:"💬 AI Chat",
    },
    {
      id:"flashcards",
      label:"🧠 Flashcards",
    },
    {
      id:"quiz",
      label:"🎯 Quiz",
    },
  ] as const;





return (

<main className="min-h-screen bg-background p-6">


<div className="mx-auto max-w-7xl space-y-5">



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





<div className="
flex
gap-2
rounded-xl
border
p-2
">

{tabs.map(tab=>(

<button

key={tab.id}

onClick={()=>
setActiveTab(tab.id)
}

className={

activeTab===tab.id

?

"rounded-lg bg-primary px-4 py-2 text-primary-foreground"

:

"rounded-lg px-4 py-2 hover:bg-muted"

}

>

{tab.label}

</button>

))}


</div>







<div className="
rounded-xl
border
min-h-[750px]
p-4
">






{activeTab==="pdf" && (

<iframe

src={
`http://localhost:8000/api/v1/documents/${documentId}/file`
}

className="
h-[720px]
w-full
rounded-lg
"

title="PDF"

/>

)}







{activeTab==="chat" && (

<div className="
flex
h-[720px]
flex-col
">

<div className="
flex-1
overflow-y-auto
space-y-4
p-4
">


{messages.map(message=>(

<div

key={message.id}

className={
message.role==="user"

?
"ml-auto max-w-[80%] rounded-xl bg-primary p-3 text-primary-foreground"

:

"max-w-[80%] rounded-xl bg-muted p-3"

}

>

<p className="font-semibold">

{
message.role==="user"
?
"You"
:
"EduQuery"
}

</p>


<p className="mt-2 whitespace-pre-wrap">

{message.content}

</p>

</div>

))}


<div ref={chatEndRef}/>

</div>





<div className="flex gap-2 border-t p-4">


<input

className="
flex-1
rounded-lg
border
px-3
"

placeholder="Ask about your lecture..."

value={question}

onChange={
e=>setQuestion(e.target.value)
}

onKeyDown={
e=>{
if(e.key==="Enter")
handleAsk();
}
}

/>



<button

onClick={handleAsk}

className="
rounded-lg
bg-primary
px-5
text-primary-foreground
"

>

Ask

</button>


</div>



</div>

)}







{activeTab==="flashcards" && (

<FlashcardGenerator
documentId={documentId}
/>

)}






{activeTab==="quiz" && (

<QuizGenerator
documentId={documentId}
/>

)}





</div>



</div>


</main>

);

}