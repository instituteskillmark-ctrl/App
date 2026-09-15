import { getSmartIntelligence } from '@/lib/services/intelligence';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateAITutorResponse(
  userPrompt: string,
  userId: string = 'default_user'
): Promise<{
  success: boolean;
  message: string;
  isConfigured: boolean;
  error?: string;
}> {
  // Check environment variables for API key
  const apiKey =
    process.env.AI_PROVIDER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_') || apiKey.includes('placeholder')) {
    return {
      success: false,
      isConfigured: false,
      message: `AI Provider API Key is not configured. Please add AI_PROVIDER_API_KEY or OPENAI_API_KEY to your .env.local file to enable the live senior tutor AI assistant.`,
      error: 'API_KEY_MISSING',
    };
  }

  // Fetch structured user learning context from database
  const intel = await getSmartIntelligence(userId);

  const contextPrompt = intel
    ? `
USER LEARNING OS CONTEXT:
- Current Target Task: "${intel.currentTask.title}" (${intel.currentTask.durationLabel || 'N/A'}, Priority: ${intel.currentTask.priority})
- Current Month: Month ${intel.currentTask.monthNumber} - ${intel.currentTask.monthTitle}
- Current Project: Project ${intel.relevantProject.projectNumber} - ${intel.relevantProject.title} (${intel.relevantProject.techStack})
- Active Streak: ${intel.streak.currentStreak} days
- Confirmed Weaknesses: ${intel.confirmedWeaknesses.map((w) => w.title).join(', ') || 'None'}
- Unverified Completed Topics: ${intel.possibleWeaknesses.map((w) => w.title).join(', ') || 'None'}

INSTRUCTIONS FOR AI TUTOR:
1. Act as a world-class Senior AI Automation Developer & Senior Full-Stack Architect.
2. Teach clearly, practically, and concisely.
3. Structure technical explanations using:
   - **Concept**: Short 1-sentence definition
   - **Simple Explanation**: Plain English explanation
   - **Example**: Concrete code snippet / n8n node configuration
   - **Practical Exercise**: Action step to build immediately
   - **Self-Check**: Quick question to test understanding
4. Prioritize the user's current roadmap task ("${intel.currentTask.title}").
5. Do not invent topics outside the roadmap. If asked about an external topic, explicitly label it as [OPTIONAL SUPPORTING KNOWLEDGE].
`
    : `Act as a Senior AI Automation Developer tutor. Teach technical automation concepts clearly with simple explanations, code examples, and practical exercises.`;

  try {
    // Standard OpenAI Chat Completion API call (supported by OpenAI, Groq, Anyscale, OpenRouter, LocalAI)
    const providerUrl = process.env.AI_PROVIDER_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.AI_MODEL_NAME || 'gpt-4o-mini';

    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: contextPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI API Error Response:', errText);
      return {
        success: false,
        isConfigured: true,
        message: `AI Service Request Failed (${response.status}). Please check API quota and credentials.`,
        error: errText,
      };
    }

    const data = await response.json();
    const assistantReply = data.choices?.[0]?.message?.content || 'No response generated.';

    return {
      success: true,
      isConfigured: true,
      message: assistantReply,
    };
  } catch (err: any) {
    console.error('AI Provider fetch error:', err);
    return {
      success: false,
      isConfigured: true,
      message: 'Failed to connect to AI provider API. Check network connectivity or server logs.',
      error: String(err),
    };
  }
}
