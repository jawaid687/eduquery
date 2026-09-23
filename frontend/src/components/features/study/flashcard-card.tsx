"use client";

import { useState } from "react";
import type { Flashcard } from "@/types";

interface FlashcardCardProps {
  card: Flashcard;
}

export function FlashcardCard({
  card,
}: FlashcardCardProps) {

  const [showAnswer, setShowAnswer] = useState(false);


  return (
    <div
      className="cursor-pointer rounded-lg border bg-card p-5 transition hover:border-primary"
      onClick={() => setShowAnswer((prev) => !prev)}
    >

      <p className="text-xs text-muted-foreground">
        Page {card.source_page} • {card.difficulty}
      </p>


      <h3 className="mt-3 font-semibold">
        {card.question}
      </h3>


      {showAnswer && (
        <div className="mt-4 border-t pt-4">

          <p className="text-sm text-muted-foreground">
            Answer
          </p>

          <p className="mt-2 text-sm">
            {card.answer}
          </p>

        </div>
      )}


      {!showAnswer && (
        <p className="mt-4 text-xs text-muted-foreground">
          Click to reveal answer
        </p>
      )}

    </div>
  );
}