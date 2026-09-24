import React, { useState, useEffect } from 'react';
import { NestedScreen } from './common/NestedScreen';
import { CustomSelect } from './common/CustomSelect';
import {
  getLocalAISettings,
  saveLocalAISettings,
  testAIConnection,
  DEFAULT_AI_SETTINGS,
} from '../services/aiService';
import { WeddingAISettings } from '../db/schema';
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Trash2,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface AIKeyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIKeyManagerModal: React.FC<AIKeyManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<WeddingAISettings>(() => getLocalAISettings());
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);

  // Connection testing state
  const [testingProvider, setTestingProvider] = useState<'openai' | 'gemini' | 'claude' | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: string;
    success: boolean;
    message: string;
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Re-read settings whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSettings(getLocalAISettings());
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (provider: 'openai' | 'gemini' | 'claude') => {
    setTestingProvider(provider);
    setTestResult(null);

    const apiKey =
      provider === 'gemini'
        ? settings.geminiApiKey
        : provider === 'openai'
        ? settings.openaiApiKey
        : settings.claudeApiKey;

    const model =
      provider === 'gemini'
        ? settings.geminiModel
        : provider === 'openai'
        ? settings.openaiModel
        : settings.claudeModel;

    const res = await testAIConnection(provider, apiKey || '', model);
    setTestingProvider(null);
    setTestResult({
      provider,
      success: res.success,
      message: res.message,
    });
  };

  const handleSave = () => {
    saveLocalAISettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all stored AI API keys from this device? This will reset credentials across all weddings.'
      )
    ) {
      const reset = { ...DEFAULT_AI_SETTINGS };
      setSettings(reset);
      saveLocalAISettings(reset);
      setTestResult(null);
    }
  };

  const isGeminiSet = Boolean(settings.geminiApiKey?.trim());
  const isOpenAISet = Boolean(settings.openaiApiKey?.trim());
  const isClaudeSet = Boolean(settings.claudeApiKey?.trim());

  return (
    <NestedScreen
      isOpen={isOpen}
      onClose={onClose}
      title="App-Wide AI Key & Model Manager"
      subtitle="Configure OpenAI, Google Gemini, and Anthropic Claude credentials shared across all weddings (100% Client-Side)"
      mode="drawer"
      width="2xl"
      level={1}
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Keys</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved App-Wide!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-stone-800 text-xs">
        {/* Security & Client-Side Standard Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
              <span>Zero-Cloud Security: Stored 100% on Your Device</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900 font-semibold">
                Client-Side
              </span>
            </h4>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              API keys are stored exclusively in your browser's local storage and used directly from your device to contact Google, OpenAI, or Anthropic. Keys are shared seamlessly across all weddings in this browser without ever touching any cloud database.
            </p>
          </div>
        </div>

        {/* Global Key Status Strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mr-1">
            Active Credentials:
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isGeminiSet
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-stone-50 text-stone-500 border-stone-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isGeminiSet ? 'bg-emerald-500' : 'bg-stone-300'}`} />
            <span>Gemini: {isGeminiSet ? 'Configured' : 'Not Set'}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isOpenAISet
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-stone-50 text-stone-500 border-stone-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOpenAISet ? 'bg-emerald-500' : 'bg-stone-300'}`} />
            <span>OpenAI: {isOpenAISet ? 'Configured' : 'Not Set'}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isClaudeSet
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-stone-50 text-stone-500 border-stone-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isClaudeSet ? 'bg-emerald-500' : 'bg-stone-300'}`} />
            <span>Claude: {isClaudeSet ? 'Configured' : 'Not Set'}</span>
          </span>
        </div>

        {/* Preferred Provider Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-stone-700 block">
            Preferred AI Provider (Default for multi-pass video generation & studio tools)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'gemini', name: 'Google Gemini', desc: 'Fast & Rich Context' },
              { id: 'openai', name: 'OpenAI GPT-4o', desc: 'Precise Storyboards' },
              { id: 'claude', name: 'Anthropic Claude', desc: 'Nuanced Prose' },
            ].map((p) => {
              const isSelected = settings.preferredProvider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, preferredProvider: p.id as any })
                  }
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-xs ring-1 ring-amber-400 font-bold'
                      : 'border-stone-200 bg-white hover:border-amber-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </div>
                  <span className="text-[10px] text-stone-500 font-normal block mt-0.5">
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PROVIDER 1: GOOGLE GEMINI */}
        <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h4 className="font-bold text-stone-900 text-xs">Google Gemini</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Recommended
              </span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-stone-700">API Key</label>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, geminiApiKey: e.target.value })
                  }
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-1.5 pr-8 rounded-xl border border-stone-300 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700">Model</label>
              <CustomSelect
                value={settings.geminiModel || 'gemini-3.6-flash'}
                onChange={(val) => setSettings({ ...settings, geminiModel: val })}
                size="sm"
                options={[
                  { value: 'gemini-3.6-flash', label: 'gemini-3.6-flash (Recommended)' },
                  { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
                  { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => handleTestConnection('gemini')}
              disabled={testingProvider === 'gemini'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {testingProvider === 'gemini' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Test Gemini Connection</span>
                </>
              )}
            </button>

            {testResult?.provider === 'gemini' && (
              <span
                className={`text-[11px] font-medium ${
                  testResult.success ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* PROVIDER 2: OPENAI */}
        <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h4 className="font-bold text-stone-900 text-xs">OpenAI</h4>
            </div>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              <span>Get OpenAI Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-stone-700">API Key</label>
              <div className="relative">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  value={settings.openaiApiKey || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, openaiApiKey: e.target.value })
                  }
                  placeholder="sk-proj-..."
                  className="w-full px-3 py-1.5 pr-8 rounded-xl border border-stone-300 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showOpenaiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700">Model</label>
              <CustomSelect
                value={settings.openaiModel || 'gpt-4o'}
                onChange={(val) => setSettings({ ...settings, openaiModel: val })}
                size="sm"
                options={[
                  { value: 'gpt-4o', label: 'gpt-4o' },
                  { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
                  { value: 'o3-mini', label: 'o3-mini' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => handleTestConnection('openai')}
              disabled={testingProvider === 'openai'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {testingProvider === 'openai' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Test OpenAI Connection</span>
                </>
              )}
            </button>

            {testResult?.provider === 'openai' && (
              <span
                className={`text-[11px] font-medium ${
                  testResult.success ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* PROVIDER 3: ANTHROPIC CLAUDE */}
        <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <h4 className="font-bold text-stone-900 text-xs">Anthropic Claude</h4>
            </div>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-semibold"
            >
              <span>Get Claude Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-stone-700">API Key</label>
              <div className="relative">
                <input
                  type={showClaudeKey ? 'text' : 'password'}
                  value={settings.claudeApiKey || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, claudeApiKey: e.target.value })
                  }
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-1.5 pr-8 rounded-xl border border-stone-300 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowClaudeKey(!showClaudeKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showClaudeKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700">Model</label>
              <CustomSelect
                value={settings.claudeModel || 'claude-3-7-sonnet-20250219'}
                onChange={(val) => setSettings({ ...settings, claudeModel: val })}
                size="sm"
                options={[
                  { value: 'claude-3-7-sonnet-20250219', label: 'claude-3-7-sonnet' },
                  { value: 'claude-3-5-haiku-20241022', label: 'claude-3-5-haiku' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => handleTestConnection('claude')}
              disabled={testingProvider === 'claude'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {testingProvider === 'claude' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Test Claude Connection</span>
                </>
              )}
            </button>

            {testResult?.provider === 'claude' && (
              <span
                className={`text-[11px] font-medium ${
                  testResult.success ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {testResult.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </NestedScreen>
  );
};
