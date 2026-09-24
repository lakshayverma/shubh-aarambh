import React, { useState, useEffect } from 'react';
import { Wedding, WeddingCustomColors, WeddingAISettings } from '../db/schema';
import { useWedding } from '../context/WeddingContext';
import { NestedScreen } from './common/NestedScreen';
import { CustomSelect } from './common/CustomSelect';
import {
  testAIConnection,
  getLocalAISettings,
  saveLocalAISettings,
  openAIKeyManager,
  AI_SETTINGS_UPDATED_EVENT,
} from '../services/aiService';
import { EInviteVideoStudio } from './pillar7/EInviteVideoStudio';
import {
  Palette,
  Sparkles,
  Check,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Bot,
  Video,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface WeddingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wedding: Wedding;
}

const COLOR_PRESETS: { name: string; colors: WeddingCustomColors }[] = [
  {
    name: 'Royal Rajputana (Crimson & Gold)',
    colors: {
      primary: '#7B1113',
      secondary: '#D97706',
      accent: '#B45309',
      background: '#FCFBF7',
      card: '#FFFFFF',
      textMain: '#271E1D',
    },
  },
  {
    name: 'Peacock Grandeur (Teal & Amber)',
    colors: {
      primary: '#0F766E',
      secondary: '#CA8A04',
      accent: '#0D9488',
      background: '#F4FBFB',
      card: '#FFFFFF',
      textMain: '#132D2B',
    },
  },
  {
    name: 'Saffron Sunset (Terracotta & Gold)',
    colors: {
      primary: '#C2410C',
      secondary: '#D97706',
      accent: '#EA580C',
      background: '#FFFDF9',
      card: '#FFFFFF',
      textMain: '#382116',
    },
  },
  {
    name: 'Pastel Romance (Blush Pink & Rose Gold)',
    colors: {
      primary: '#BE185D',
      secondary: '#B45309',
      accent: '#E11D48',
      background: '#FDF9F8',
      card: '#FFFFFF',
      textMain: '#37282F',
    },
  },
  {
    name: 'Modern Sapphire (Midnight Blue & Indigo)',
    colors: {
      primary: '#1E3A8A',
      secondary: '#4F46E5',
      accent: '#2563EB',
      background: '#F8FAFC',
      card: '#FFFFFF',
      textMain: '#0F172A',
    },
  },
];

export const WeddingSettingsModal: React.FC<WeddingSettingsModalProps> = ({
  isOpen,
  onClose,
  wedding,
}) => {
  const { updateWedding } = useWedding();

  const [activeTab, setActiveTab] = useState<'theme' | 'ai'>('theme');

  // Pair Terminology
  const [brideSideTerm, setBrideSideTerm] = useState(
    wedding.brideSideTerm || "Bride's Side (Ladkiwale)"
  );
  const [groomSideTerm, setGroomSideTerm] = useState(
    wedding.groomSideTerm || "Groom's Side (Ladkewale)"
  );
  const [brideSideName, setBrideSideName] = useState(wedding.brideSideName || '');
  const [groomSideName, setGroomSideName] = useState(wedding.groomSideName || '');

  // Custom Colors
  const [primaryColor, setPrimaryColor] = useState(
    wedding.customColors?.primary || '#7B1113'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    wedding.customColors?.secondary || '#D97706'
  );
  const [accentColor, setAccentColor] = useState(
    wedding.customColors?.accent || '#B45309'
  );
  const [backgroundColor, setBackgroundColor] = useState(
    wedding.customColors?.background || '#FCFBF7'
  );

  // AI Settings State (Initializes from localStorage with fallback to wedding.aiSettings)
  const initialAISettings = getLocalAISettings(wedding.aiSettings);
  const [openaiApiKey, setOpenaiApiKey] = useState(initialAISettings.openaiApiKey || '');
  const [openaiModel, setOpenaiModel] = useState(initialAISettings.openaiModel || 'gpt-4o');
  const [geminiApiKey, setGeminiApiKey] = useState(initialAISettings.geminiApiKey || '');
  const [geminiModel, setGeminiModel] = useState(initialAISettings.geminiModel || 'gemini-3.6-flash');
  const [claudeApiKey, setClaudeApiKey] = useState(initialAISettings.claudeApiKey || '');
  const [claudeModel, setClaudeModel] = useState(
    initialAISettings.claudeModel || 'claude-3-7-sonnet-20250219'
  );
  const [preferredProvider, setPreferredProvider] = useState<'gemini' | 'openai' | 'claude'>(
    initialAISettings.preferredProvider || 'gemini'
  );

  // Password visibility toggles
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);

  // Connection testing status
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string } | null>
  >({});

  // Video Studio Sub-Drawer
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);

  // Sync AI settings reactively when changed anywhere in the app
  useEffect(() => {
    const syncAISettings = () => {
      const fresh = getLocalAISettings(wedding.aiSettings);
      setOpenaiApiKey(fresh.openaiApiKey || '');
      setOpenaiModel(fresh.openaiModel || 'gpt-4o');
      setGeminiApiKey(fresh.geminiApiKey || '');
      setGeminiModel(fresh.geminiModel || 'gemini-3.6-flash');
      setClaudeApiKey(fresh.claudeApiKey || '');
      setClaudeModel(fresh.claudeModel || 'claude-3-7-sonnet-20250219');
      setPreferredProvider(fresh.preferredProvider || 'gemini');
    };

    window.addEventListener(AI_SETTINGS_UPDATED_EVENT, syncAISettings);
    return () => window.removeEventListener(AI_SETTINGS_UPDATED_EVENT, syncAISettings);
  }, [wedding.aiSettings]);

  const handleApplyPreset = (preset: { name: string; colors: WeddingCustomColors }) => {
    setPrimaryColor(preset.colors.primary);
    setSecondaryColor(preset.colors.secondary);
    setAccentColor(preset.colors.accent);
    setBackgroundColor(preset.colors.background || '#FCFBF7');
  };

  const handleTestConnection = async (provider: 'openai' | 'gemini' | 'claude') => {
    setTestingProvider(provider);
    setTestResults((prev) => ({ ...prev, [provider]: null }));

    const key =
      provider === 'openai'
        ? openaiApiKey
        : provider === 'gemini'
        ? geminiApiKey
        : claudeApiKey;
    const model =
      provider === 'openai'
        ? openaiModel
        : provider === 'gemini'
        ? geminiModel
        : claudeModel;

    const res = await testAIConnection(provider, key, model);
    setTestResults((prev) => ({ ...prev, [provider]: res }));
    setTestingProvider(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const aiSettings: WeddingAISettings = {
      openaiApiKey: openaiApiKey.trim(),
      openaiModel,
      geminiApiKey: geminiApiKey.trim(),
      geminiModel,
      claudeApiKey: claudeApiKey.trim(),
      claudeModel,
      preferredProvider,
    };

    // Save to local storage for persistence across all weddings
    saveLocalAISettings(aiSettings);

    // Save to active wedding
    await updateWedding({
      ...wedding,
      brideSideTerm,
      groomSideTerm,
      brideSideName,
      groomSideName,
      customColors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        background: backgroundColor,
        card: '#FFFFFF',
        textMain: '#271E1D',
      },
      aiSettings,
    });
    onClose();
  };

  const handleResetColors = () => {
    setPrimaryColor('#7B1113');
    setSecondaryColor('#D97706');
    setAccentColor('#B45309');
    setBackgroundColor('#FCFBF7');
  };

  return (
    <>
      <NestedScreen
        isOpen={isOpen}
        onClose={onClose}
        title="Wedding Settings & AI Integrations"
        subtitle={`Configure theme colors, bilateral terms, and AI API keys for ${wedding.brideName} & ${wedding.groomName}`}
        mode="drawer"
        width="2xl"
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings & Keys</span>
            </button>
          </>
        }
      >
        <div className="space-y-6 text-stone-800">
          {/* Settings Tabs Header */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'theme'
                  ? 'bg-[#7B1113] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Theme & Terminology</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ai'
                  ? 'bg-[#7B1113] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Integrations & API Keys</span>
            </button>
          </div>

          {/* TAB 1: THEME & TERMINOLOGY */}
          {activeTab === 'theme' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Pair Terminology Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-theme-primary font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Pair & Family Group Terminology</span>
                </div>
                <p className="text-xs text-stone-600">
                  Customize how both sides are addressed across calendar filters, guest lists, seating charts, and e-invites.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-800">
                      Bride's Side Display Term
                    </label>
                    <input
                      type="text"
                      value={brideSideTerm}
                      onChange={(e) => setBrideSideTerm(e.target.value)}
                      placeholder="e.g. Ladkiwale or Team Ananya"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-800">
                      Groom's Side Display Term
                    </label>
                    <input
                      type="text"
                      value={groomSideTerm}
                      onChange={(e) => setGroomSideTerm(e.target.value)}
                      placeholder="e.g. Ladkewale or Team Aarav"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-800">
                      Bride's Family Name
                    </label>
                    <input
                      type="text"
                      value={brideSideName}
                      onChange={(e) => setBrideSideName(e.target.value)}
                      placeholder="e.g. Sharma Family"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-800">
                      Groom's Family Name
                    </label>
                    <input
                      type="text"
                      value={groomSideName}
                      onChange={(e) => setGroomSideName(e.target.value)}
                      placeholder="e.g. Verma Family"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Color Presets Section */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-theme-primary font-bold text-sm">
                    <Palette className="w-4 h-4" />
                    <span>Curated Indian Wedding Palettes</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetColors}
                    className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-theme-primary transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected =
                      primaryColor === preset.colors.primary &&
                      secondaryColor === preset.colors.secondary;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-theme-primary bg-theme-primary-light/30 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-stone-800 block">
                            {preset.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                              style={{ backgroundColor: preset.colors.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                              style={{ backgroundColor: preset.colors.secondary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                              style={{ backgroundColor: preset.colors.accent }}
                            />
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-theme-primary text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fine-Tuning Colors */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <span className="text-xs font-bold text-stone-800 block">
                  Fine-Tune Hex Color Codes
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone-600 block">
                      Primary (Headers)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-stone-300 bg-white text-stone-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone-600 block">
                      Secondary (Badges)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-stone-300 bg-white text-stone-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone-600 block">
                      Accent (Highlights)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-stone-300 bg-white text-stone-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone-600 block">
                      Canvas Backdrop
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-stone-300 bg-white text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI INTEGRATIONS & API KEYS */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Privacy Guarantee Banner */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-900">
                    100% Client-Side Privacy Guarantee
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Your API keys are stored only in your local browser and sent directly to the official provider endpoints (OpenAI, Google Gemini, Anthropic) via encrypted HTTPS. Vivah Planner has zero intermediate servers and never logs or stores your keys.
                  </p>
                </div>
              </div>

              {/* App-Wide Keys Callout */}
              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-700" />
                    <h4 className="text-xs font-bold text-indigo-950">App-Wide AI Credentials</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Shared across all weddings
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                    API keys and model choices configured here are stored locally in your browser and automatically shared across all weddings on this device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAIKeyManager()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-300 bg-white hover:bg-indigo-50 text-xs font-bold text-indigo-700 shadow-2xs transition-colors shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Open Key Manager</span>
                </button>
              </div>

              {/* Preferred AI Provider Dropdown */}
              <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <CustomSelect
                  label="Preferred Active AI Engine"
                  value={preferredProvider}
                  onChange={(val) => setPreferredProvider(val as any)}
                  options={[
                    {
                      value: 'gemini',
                      label: 'Google Gemini',
                      description: 'Recommended: Fast, multi-lingual, generous free tier',
                      badge: 'GEMINI',
                    },
                    {
                      value: 'openai',
                      label: 'OpenAI (GPT-4o)',
                      description: 'High narrative nuance and prompt creativity',
                      badge: 'OPENAI',
                    },
                    {
                      value: 'claude',
                      label: 'Anthropic Claude',
                      description: 'Exceptional cultural comprehension and complex prompt writing',
                      badge: 'CLAUDE',
                    },
                  ]}
                />
              </div>

              {/* 1. Google Gemini */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="font-bold text-xs text-stone-900">Google Gemini API</span>
                  </div>

                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                  >
                    <span>Get Free Gemini Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Gemini API Key</label>
                    <div className="relative flex items-center">
                      <input
                        type={showGeminiKey ? 'text' : 'password'}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-3 py-1.5 pr-9 rounded-xl border border-stone-300 font-mono text-xs bg-white text-stone-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey((p) => !p)}
                        className="absolute right-2 text-stone-400 hover:text-stone-600"
                      >
                        {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Model</label>
                    <CustomSelect
                      value={geminiModel}
                      onChange={(val) => setGeminiModel(val)}
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

                  {testResults.gemini && (
                    <span
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        testResults.gemini.success ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {testResults.gemini.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{testResults.gemini.message}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 2. OpenAI */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-xs text-stone-900">OpenAI API (GPT-4o / Sora)</span>
                  </div>

                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline"
                  >
                    <span>Get OpenAI Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">OpenAI API Key</label>
                    <div className="relative flex items-center">
                      <input
                        type={showOpenaiKey ? 'text' : 'password'}
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        placeholder="sk-proj-..."
                        className="w-full px-3 py-1.5 pr-9 rounded-xl border border-stone-300 font-mono text-xs bg-white text-stone-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenaiKey((p) => !p)}
                        className="absolute right-2 text-stone-400 hover:text-stone-600"
                      >
                        {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Model</label>
                    <CustomSelect
                      value={openaiModel}
                      onChange={(val) => setOpenaiModel(val)}
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

                  {testResults.openai && (
                    <span
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        testResults.openai.success ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {testResults.openai.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{testResults.openai.message}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Anthropic Claude */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span className="font-bold text-xs text-stone-900">Anthropic Claude API</span>
                  </div>

                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:underline"
                  >
                    <span>Get Claude Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Claude API Key</label>
                    <div className="relative flex items-center">
                      <input
                        type={showClaudeKey ? 'text' : 'password'}
                        value={claudeApiKey}
                        onChange={(e) => setClaudeApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full px-3 py-1.5 pr-9 rounded-xl border border-stone-300 font-mono text-xs bg-white text-stone-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaudeKey((p) => !p)}
                        className="absolute right-2 text-stone-400 hover:text-stone-600"
                      >
                        {showClaudeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Model</label>
                    <CustomSelect
                      value={claudeModel}
                      onChange={(val) => setClaudeModel(val)}
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
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Test Claude Connection</span>
                      </>
                    )}
                  </button>

                  {testResults.claude && (
                    <span
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        testResults.claude.success ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {testResults.claude.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{testResults.claude.message}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Link to AI Video Studio */}
              <div className="p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <Video className="w-4 h-4 text-amber-700" />
                    <span>Multi-Pass AI Video Studio</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Synthesize video prompts for Sora, Runway, and Luma from your E-Invite records.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVideoStudioOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7B1113] hover:bg-[#650e10] text-white text-xs font-bold shadow hover:shadow-md transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open Video Studio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </NestedScreen>

      {/* AI Video Generation Studio Sub-Drawer */}
      {isVideoStudioOpen && (
        <EInviteVideoStudio
          isOpen={isVideoStudioOpen}
          onClose={() => setIsVideoStudioOpen(false)}
          wedding={wedding}
        />
      )}
    </>
  );
};
