'use client';

import React, { useState, useTransition } from 'react';
import { actionSubmitAssessment } from '@/lib/actions/app-actions';
import { Award, CheckCircle2, XCircle, X, Loader2, HelpCircle } from 'lucide-react';

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
    <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-6 space-y-6 max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            VERIFICATION ASSESSMENT
          </span>
          <h3 className="text-base font-bold text-slate-100 mt-1">{title}</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-[#080d19] border border-slate-800 text-slate-400 hover:text-white text-xs font-mono transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {result ? (
        <div className="text-center py-8 space-y-4 bg-[#080d19] rounded-xl border border-slate-800/80 p-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold font-mono text-2xl mx-auto shadow-lg ${
              result.passed
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                : 'bg-rose-950 text-rose-300 border border-rose-700/80'
            }`}
          >
            {result.passed ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <XCircle className="w-8 h-8 text-rose-400" />}
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono text-slate-100">{result.scorePercent}%</div>
            <h4 className="text-base font-bold text-slate-100">
              {result.passed ? '🎉 Knowledge Verified!' : 'Needs Revision'}
            </h4>
            <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
              {result.passed
                ? 'Congratulations! This topic status has now been automatically upgraded to VERIFIED in your database.'
                : 'Scored under passing criteria (80%). Review curriculum concepts and attempt again.'}
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#0e1420] hover:bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 transition font-bold"
            >
              Return to Learning Workspace
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, qIdx) => (
            <div key={q.id} className="bg-[#080d19] border border-slate-800/80 rounded-xl p-4.5 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 font-mono flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Q{qIdx + 1}: {q.questionText}</span>
              </h4>

              <div className="space-y-2 pt-1">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center space-x-3 p-3 rounded-lg border text-xs cursor-pointer font-mono transition ${
                      selectedAnswers[qIdx] === optIdx
                        ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200 font-semibold shadow-xs'
                        : 'bg-[#0e1420] border-slate-800 text-slate-300 hover:bg-[#121927]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${qIdx}`}
                      checked={selectedAnswers[qIdx] === optIdx}
                      onChange={() => handleSelectOption(qIdx, optIdx)}
                      className="accent-cyan-500 w-4 h-4"
                    />
                    <span className="leading-relaxed">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Answers...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Submit Answers for Skill Verification</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

