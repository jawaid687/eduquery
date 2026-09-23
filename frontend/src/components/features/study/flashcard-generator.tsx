"use client";

import { useState } from "react";
import {
  generateFlashcards,
  listFlashcards,
} from "@/lib/api-client";
import type { Flashcard } from "@/types";
import { FlashcardCard } from "./flashcard-card";


interface Props {
  documentId: string;
}


export function FlashcardGenerator({
  documentId,
}: Props) {

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);


  const handleGenerate = async () => {

    setLoading(true);

    try {

      const response =
        await generateFlashcards(
          documentId,
          5,
          "medium",
        );


      setCards(response.flashcards);


    } finally {

      setLoading(false);

    }

  };



  const loadExisting = async () => {

    const response =
      await listFlashcards(documentId);

    setCards(response.flashcards);

  };



  return (
    <section className="border-t p-4">


      <div className="flex gap-2">

        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading
            ? "Generating..."
            : "Generate Flashcards"}
        </button>


        <button
          className="rounded-md border px-4 py-2"
          onClick={loadExisting}
        >
          Load Saved
        </button>

      </div>



      <div className="mt-4 space-y-3">

        {cards.map((card) => (

          <FlashcardCard
            key={card.id}
            card={card}
          />

        ))}

      </div>


    </section>
  );
}