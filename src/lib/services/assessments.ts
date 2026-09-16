import { db } from '@/db';
import { assessments, assessmentQuestions, assessmentAttempts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { updateTaskStatus } from './roadmap';

export async function getAssessmentForTask(taskId: string) {
  try {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.taskId, taskId));

    if (!assessment) return null;

    const questions = await db
      .select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.assessmentId, assessment.id));

    return {
      assessment,
      questions: questions.map((q) => ({
        ...q,
        options: q.optionsJson ? JSON.parse(q.optionsJson) : [],
      })),
    };
  } catch (err) {
    console.error('Error fetching assessment:', err);
    return null;
  }
}

export async function submitAssessmentAttempt(data: {
  assessmentId: string;
  taskId: string;
  userAnswers: number[]; // Array of selected option indices corresponding to questions
  userId?: string;
}) {
  try {
    const userId = data.userId || 'default_user';

    const questions = await db
      .select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.assessmentId, data.assessmentId));

    if (questions.length === 0) {
      return { success: false, error: 'No assessment questions found.' };
    }

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (data.userAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercent >= 80;

    // Save attempt
    const [attempt] = await db
      .insert(assessmentAttempts)
      .values({
        userId,
        assessmentId: data.assessmentId,
        scorePercent,
        passed,
        completedAt: new Date(),
        notes: `Scored ${scorePercent}% (${correctCount}/${questions.length} correct)`,
      })
      .returning();

    // If passed, upgrade topic status to VERIFIED, otherwise mark NEEDS_REVISION
    if (passed) {
      await updateTaskStatus(data.taskId, 'VERIFIED', userId);
    } else {
      await updateTaskStatus(data.taskId, 'NEEDS_REVISION', userId);
    }

    return {
      success: true,
      scorePercent,
      passed,
      attempt,
    };
  } catch (err) {
    console.error('Error submitting assessment attempt:', err);
    return { success: false, error: String(err) };
  }
}
