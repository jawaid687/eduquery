"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/types";

interface QuizCardProps {
  question: QuizQuestion;
}

export function QuizCard({ question }: QuizCardProps) {

  const [selected, setSelected] =
    useState<string | null>(null);

  const [submitted, setSubmitted] =
    useState(false);


  const isCorrect =
    selected === question.correct_answer;



  return (

    <div className="rounded-lg border bg-card p-5 space-y-4">


      <div>

        <p className="text-xs text-muted-foreground">
          Page {question.source_page} • {question.difficulty}
        </p>


        <h3 className="mt-2 font-semibold">
          {question.question}
        </h3>

      </div>




      {question.options && (

        <div className="space-y-2">

          {question.options.map((option) => (

            <button

              key={option}

              onClick={() => {

                if (!submitted) {
                  setSelected(option);
                }

              }}

              className={

                selected === option

                  ? "w-full rounded-md border bg-primary p-3 text-left text-primary-foreground"

                  : "w-full rounded-md border p-3 text-left hover:bg-muted"

              }

            >

              {option}

            </button>


          ))}


        </div>

      )}






      {question.options && !submitted && (

        <button

          disabled={!selected}

          onClick={() => setSubmitted(true)}

          className="rounded-md bg-primary px-5 py-2 text-primary-foreground disabled:opacity-50"

        >

          Submit Answer

        </button>

      )}







      {submitted && (

        <div className="rounded-md bg-muted p-3 text-sm">


          {isCorrect ? (

            <p className="font-semibold text-green-600">
              Correct ✓
            </p>

          ) : (

            <p className="font-semibold text-red-600">
              Incorrect
            </p>

          )}




          <p className="mt-2">
            Answer: {question.correct_answer}
          </p>




          {question.explanation && (

            <p className="mt-2">
              {question.explanation}
            </p>

          )}



        </div>

      )}






      {question.question_type === "short_answer" && (

        <ShortAnswerReveal question={question}/>

      )}



    </div>

  );

}





function ShortAnswerReveal({
  question,
}: QuizCardProps) {


  const [showAnswer,setShowAnswer] =
    useState(false);



  return (

    <>

      {!showAnswer && (

        <button

          onClick={() => setShowAnswer(true)}

          className="rounded-md border px-4 py-2"

        >

          Show Answer

        </button>

      )}




      {showAnswer && (

        <div className="rounded-md bg-muted p-3">


          <p className="font-semibold">
            Answer
          </p>


          <p>
            {question.correct_answer}
          </p>


          {question.explanation && (

            <p className="mt-2 text-sm">
              {question.explanation}
            </p>

          )}


        </div>

      )}

    </>

  );

}