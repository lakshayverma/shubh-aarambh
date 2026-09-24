import { WeddingAISettings } from '../db/schema';

const STORAGE_KEY = 'vivah_planner_ai_config';

export const DEFAULT_AI_SETTINGS: WeddingAISettings = {
  openaiApiKey: '',
  openaiModel: 'gpt-4o',
  geminiApiKey: '',
  geminiModel: 'gemini-3.6-flash',
  claudeApiKey: '',
  claudeModel: 'claude-3-7-sonnet-20250219',
  preferredProvider: 'gemini',
};

// Retrieve settings from localStorage merged with wedding settings
export const getLocalAISettings = (fallbackSettings?: WeddingAISettings): WeddingAISettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const local = raw ? JSON.parse(raw) : {};
    const settings = {
      ...DEFAULT_AI_SETTINGS,
      ...fallbackSettings,
      ...local,
    };
    if (settings.geminiModel === 'gemini-2.5-flash') {
      settings.geminiModel = 'gemini-3.6-flash';
    }
    return settings;
  } catch {
    return { ...DEFAULT_AI_SETTINGS, ...fallbackSettings };
  }
};

export const AI_SETTINGS_UPDATED_EVENT = 'vivah_ai_settings_updated';
export const OPEN_AI_KEY_MANAGER_EVENT = 'open_ai_key_manager';

// Helper to open the app-wide AI Key Manager from anywhere in the app
export const openAIKeyManager = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_AI_KEY_MANAGER_EVENT));
  }
};

// Check if any AI key is configured
export const hasConfiguredAIKey = (settings?: WeddingAISettings): boolean => {
  const s = settings || getLocalAISettings();
  return Boolean(
    (s.geminiApiKey && s.geminiApiKey.trim()) ||
    (s.openaiApiKey && s.openaiApiKey.trim()) ||
    (s.claudeApiKey && s.claudeApiKey.trim())
  );
};

// Persist settings locally and broadcast update event app-wide
export const saveLocalAISettings = (settings: WeddingAISettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AI_SETTINGS_UPDATED_EVENT, { detail: settings }));
    }
  } catch (err) {
    console.error('Failed to save AI settings to localStorage', err);
  }
};

// Test connection to verify API keys
export const testAIConnection = async (
  provider: 'openai' | 'gemini' | 'claude',
  apiKey: string,
  model?: string
): Promise<{ success: boolean; message: string }> => {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Please provide an API key first.' };
  }

  const key = apiKey.trim();

  try {
    if (provider === 'gemini') {
      const selectedModel = model || 'gemini-3.6-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${key}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the single word: "Namaste"' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      return { success: true, message: `Connected to Gemini successfully! Response: "${reply}"` };
    }

    if (provider === 'openai') {
      const selectedModel = model || 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: 'Respond with the single word: "Namaste"' }],
          max_tokens: 10,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim() || '';
      return { success: true, message: `Connected to OpenAI successfully! Response: "${reply}"` };
    }

    if (provider === 'claude') {
      const selectedModel = model || 'claude-3-5-haiku-20241022';
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Respond with the single word: "Namaste"' }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const reply = data?.content?.[0]?.text?.trim() || '';
      return { success: true, message: `Connected to Anthropic Claude successfully! Response: "${reply}"` };
    }

    return { success: false, message: 'Unsupported provider' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed' };
  }
};

// General completion request
export const callAICompletion = async (
  prompt: string,
  systemPrompt: string,
  settings: WeddingAISettings
): Promise<string> => {
  const provider = settings.preferredProvider || 'gemini';

  if (provider === 'gemini') {
    const key = settings.geminiApiKey?.trim();
    if (!key) throw new Error('Gemini API key is not configured in Settings.');
    const model = settings.geminiModel || 'gemini-3.6-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini API error (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (provider === 'openai') {
    const key = settings.openaiApiKey?.trim();
    if (!key) throw new Error('OpenAI API key is not configured in Settings.');
    const model = settings.openaiModel || 'gpt-4o';

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI API error (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  if (provider === 'claude') {
    const key = settings.claudeApiKey?.trim();
    if (!key) throw new Error('Anthropic Claude API key is not configured in Settings.');
    const model = settings.claudeModel || 'claude-3-7-sonnet-20250219';

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Claude API error (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data?.content?.[0]?.text || '';
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
};
