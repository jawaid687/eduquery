"use client";

import { useState } from "react";
import { generateQuiz } from "@/lib/api-client";
import type { QuizQuestion } from "@/types";

interface QuizGeneratorProps {
  documentId: string;
}

export function QuizGenerator({
  documentId,
}: QuizGeneratorProps) {

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  const currentQuestion = questions[currentIndex];



  const handleGenerate = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await generateQuiz(
        documentId,
        5,
        "medium"
      );


      setQuestions(response.questions);
      setCurrentIndex(0);
      setAnswer("");
      setSubmitted(false);
      setScore(0);
      setFinished(false);


    } catch {

      setError("Failed to generate quiz.");

    } finally {

      setLoading(false);

    }

  };





  const checkAnswer = () => {

    if (!answer.trim()) return;


    setSubmitted(true);


    if (
      answer.trim().toLowerCase() ===
      currentQuestion.correct_answer.trim().toLowerCase()
    ) {

      setScore((prev) => prev + 1);

    }

  };





  const nextQuestion = () => {


    if (currentIndex + 1 >= questions.length) {

      setFinished(true);
      return;

    }


    setCurrentIndex((prev) => prev + 1);

    setAnswer("");

    setSubmitted(false);

  };





  const isCorrect =
    answer.trim().toLowerCase() ===
    currentQuestion?.correct_answer
      ?.trim()
      .toLowerCase();






  return (

    <div className="space-y-6">


      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-xl bg-primary px-5 py-3 text-primary-foreground"
      >

        {loading ? "Generating..." : "Generate Quiz"}

      </button>





      {error && (

        <p className="text-sm text-red-600">
          {error}
        </p>

      )}







      {currentQuestion && !finished && (

        <div className="space-y-5">


          <div>

            <div className="mb-2 flex justify-between text-sm">

              <span>
                Question {currentIndex + 1} / {questions.length}
              </span>


              <span>
                Score {score}
              </span>

            </div>


            <div className="h-2 rounded-full bg-muted">

              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width:
                    `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />

            </div>

          </div>






          <div className="rounded-2xl border bg-card p-6 shadow-sm">


            <p className="mb-2 text-xs text-muted-foreground">

              {currentQuestion.question_type}

            </p>



            <h2 className="text-xl font-bold">

              {currentQuestion.question}

            </h2>






            <div className="mt-5 space-y-3">


              {currentQuestion.options ? (

                currentQuestion.options.map((option) => (

                  <button
                    key={option}
                    disabled={submitted}
                    onClick={() => setAnswer(option)}
                    className={
                      answer === option
                        ? "w-full rounded-xl border bg-primary p-4 text-left text-primary-foreground"
                        : "w-full rounded-xl border p-4 text-left hover:bg-muted"
                    }
                  >

                    {option}

                  </button>

                ))

              ) : (

                <textarea
                  disabled={submitted}
                  value={answer}
                  onChange={(e) =>
                    setAnswer(e.target.value)
                  }
                  placeholder="Write your answer..."
                  className="min-h-32 w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-primary"
                />

              )}


            </div>







            {!submitted && (

              <button
                onClick={checkAnswer}
                disabled={!answer.trim()}
                className="mt-5 rounded-xl bg-primary px-5 py-3 text-primary-foreground disabled:opacity-50"
              >

                Submit Answer

              </button>

            )}







            {submitted && (

              <div className="mt-5 space-y-3 rounded-xl bg-muted p-4">


                <p
                  className={
                    isCorrect
                      ? "font-bold text-green-600"
                      : "font-bold text-red-600"
                  }
                >

                  {isCorrect
                    ? "✓ Correct Answer"
                    : "✗ Incorrect"}

                </p>




                <div>

                  <p className="font-semibold">
                    Correct Answer:
                  </p>

                  <p>
                    {currentQuestion.correct_answer}
                  </p>

                </div>




                {currentQuestion.explanation && (

                  <p className="text-sm">
                    {currentQuestion.explanation}
                  </p>

                )}






                <button
                  onClick={nextQuestion}
                  className="rounded-xl bg-primary px-5 py-3 text-primary-foreground"
                >

                  {currentIndex + 1 === questions.length
                    ? "Finish Quiz"
                    : "Next Question →"}

                </button>


              </div>

            )}



          </div>


        </div>

      )}







      {finished && (

        <div className="rounded-2xl border p-8 text-center">


          <h2 className="text-3xl font-bold">
            🎉 Quiz Completed
          </h2>


          <p className="mt-4 text-xl">

            Score: {score}/{questions.length}

          </p>


          <p className="mt-2">

            Accuracy:
            {" "}
            {Math.round(
              (score / questions.length) * 100
            )}
            %

          </p>




          <button
            onClick={handleGenerate}
            className="mt-6 rounded-xl border px-5 py-3"
          >

            Try Again

          </button>


        </div>

      )}


    </div>

  );

}