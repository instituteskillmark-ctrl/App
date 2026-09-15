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
    <div className="bg-[#12161c] border border-[#252b34] rounded-xl p-6 space-y-6 max-w-2xl mx-auto shadow-sm">
      <div className="flex items-center justify-between border-b border-[#252b34] pb-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Verification Assessment
          </span>
          <h3 className="text-base font-semibold text-[#f5f7fa] mt-1">{title}</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#171c23] border border-[#252b34] text-[#9aa3af] hover:text-[#f5f7fa] transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {result ? (
        <div className="text-center py-8 space-y-4 bg-[#171c23] rounded-xl border border-[#252b34] p-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-sm ${
              result.passed
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
            }`}
          >
            {result.passed ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <XCircle className="w-8 h-8 text-rose-400" />}
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-[#f5f7fa]">{result.scorePercent}%</div>
            <h4 className="text-base font-semibold text-[#f5f7fa]">
              {result.passed ? 'Knowledge Verified' : 'Needs Revision'}
            </h4>
            <p className="text-xs text-[#9aa3af] max-w-md mx-auto">
              {result.passed
                ? 'Congratulations! This topic status has been automatically updated to Verified.'
                : 'Scored below passing criteria. Review the curriculum concepts and try again.'}
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#12161c] hover:bg-[#252b34] border border-[#252b34] rounded-lg text-xs text-[#f5f7fa] transition font-semibold"
            >
              Return to Workspace
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, qIdx) => (
            <div key={q.id} className="bg-[#171c23] border border-[#252b34] rounded-xl p-4.5 space-y-3">
              <h4 className="text-xs font-semibold text-[#f5f7fa] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Q{qIdx + 1}: {q.questionText}</span>
              </h4>

              <div className="space-y-2 pt-1">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center space-x-3 p-3 rounded-lg border text-xs cursor-pointer transition ${
                      selectedAnswers[qIdx] === optIdx
                        ? 'bg-[#12161c] border-[#374151] text-[#f5f7fa] font-semibold'
                        : 'bg-[#12161c] border-[#252b34] text-[#9aa3af] hover:bg-[#171c23]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${qIdx}`}
                      checked={selectedAnswers[qIdx] === optIdx}
                      onChange={() => handleSelectOption(qIdx, optIdx)}
                      className="accent-emerald-500 w-4 h-4"
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
            className="w-full py-3 bg-[#f5f7fa] hover:bg-white text-[#08090c] text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2"
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


