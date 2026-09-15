'use client';

import React, { useState, useTransition } from 'react';
import { actionSubmitAssessment } from '@/lib/actions/app-actions';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  answerExplanation?: string | null;
}

interface AssessmentQuizProps {
  assessmentId: string;
  taskId: string;
  title: string;
  questions: Question[];
  onClose?: () => void;
}

export function AssessmentQuiz({ assessmentId, taskId, title, questions, onClose }: AssessmentQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [result, setResult] = useState<{ scorePercent: number; passed: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[questionIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnswers.includes(-1)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    startTransition(async () => {
      const res = await actionSubmitAssessment({
        assessmentId,
        taskId,
        userAnswers: selectedAnswers,
      });

      if (res.success && res.scorePercent !== undefined) {
        setResult({
          scorePercent: res.scorePercent,
          passed: !!res.passed,
        });
      }
    });
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6 max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div>
          <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider block">
            VERIFICATION ASSESSMENT
          </span>
          <h3 className="text-base font-bold text-slate-100 mt-0.5">{title}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs font-mono">
            ✕ Close
          </button>
        )}
      </div>

      {result ? (
        <div className="text-center py-8 space-y-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mx-auto ${
              result.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-red-950 text-red-300 border border-red-700'
            }`}
          >
            {result.scorePercent}%
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-100">
              {result.passed ? '🎉 Knowledge Verified!' : 'Needs Revision'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {result.passed
                ? 'Congratulations! This topic status is now upgraded to VERIFIED.'
                : 'Scored under passing criteria (80%). Review concepts and try again.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 transition"
          >
            Return to Learning
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, qIdx) => (
            <div key={q.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-200 font-mono">
                Q{qIdx + 1}: {q.questionText}
              </h4>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center space-x-3 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      selectedAnswers[qIdx] === optIdx
                        ? 'bg-cyan-950/60 border-cyan-800 text-cyan-200'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${qIdx}`}
                      checked={selectedAnswers[qIdx] === optIdx}
                      onChange={() => handleSelectOption(qIdx, optIdx)}
                      className="accent-cyan-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition font-mono shadow-lg shadow-emerald-950"
          >
            {isPending ? 'Submitting & Evaluating...' : 'Submit Answers for Verification'}
          </button>
        </form>
      )}
    </div>
  );
}
