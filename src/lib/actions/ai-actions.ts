'use server';

import { generateAITutorResponse } from '@/lib/ai/provider';
import { planStudySessionTime, getSmartIntelligence } from '@/lib/services/intelligence';

export async function actionAskAITutor(prompt: string) {
  return await generateAITutorResponse(prompt);
}

export async function actionGetTimeBlockPlan(minutes: number) {
  return await planStudySessionTime(minutes);
}

export async function actionGetSmartIntelligence() {
  return await getSmartIntelligence();
}
