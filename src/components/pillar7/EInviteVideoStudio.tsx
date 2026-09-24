import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, EInvite, WeddingEvent } from '../../db/schema';
import { NestedScreen } from '../common/NestedScreen';
import { CustomSelect } from '../common/CustomSelect';
import { getLocalAISettings, openAIKeyManager, AI_SETTINGS_UPDATED_EVENT } from '../../services/aiService';
import {
  generateAlgorithmicPromptPack,
  executeMultiPassAIPipeline,
  synthesizeScenePrompts,
  assembleMetaPrompt,
  getDefaultVideoPromptOptions,
  TARGET_VIDEO_MODELS,
  VISUAL_STYLES,
  LENS_PRESETS,
  LIGHTING_PRESETS,
  PACING_PRESETS,
  CULTURAL_ACCENTS_LIST,
  SHOT_TYPES,
  CAMERA_MOTIONS,
  LIGHTING_CONFIGS,
  LENS_CONFIGS,
  PACING_CONFIGS,
  ATMOSPHERE_FX,
  AUDIO_MOODS,
  COLOR_TONES,
  FOLEY_PRESETS,
  TargetVideoModel,
  VideoPromptOptions,
  MultiPassVideoPromptPack,
  VideoSceneStoryboard,
} from '../../services/videoPromptPipeline';
import {
  Video,
  Sparkles,
  Copy,
  Check,
  CheckCheck,
  Download,
  FileText,
  Play,
  Layers,
  Camera,
  Music,
  Clock,
  Shield,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  Eye,
  Palette,
  Calendar,
  MapPin,
  Phone,
  Heart,
  Wand2,
  RotateCcw,
  Edit3,
  Settings2,
  Sun,
  Flame,
  Volume2,
  Zap,
  Radio,
  KeyRound,
  Save,
  MessageSquare,
} from 'lucide-react';

interface EInviteVideoStudioProps {
  isOpen: boolean;
  onClose: () => void;
  wedding: Wedding;
  initialInviteId?: string;
}

export const EInviteVideoStudio: React.FC<EInviteVideoStudioProps> = ({
  isOpen,
  onClose,
  wedding,
  initialInviteId,
}) => {
  const invites = useLiveQuery(
    () => db.eInvites.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );

  const events = useLiveQuery(
    () => db.events.where('weddingId').equals(wedding.id).sortBy('orderIndex'),
    [wedding.id]
  );

  const [selectedInviteId, setSelectedInviteId] = useState<string>(initialInviteId || '');
  const [targetModel, setTargetModel] = useState<TargetVideoModel>('sora');
  // Top-level tabs strictly sequential: Pass 1 -> Pass 2 -> Pass 3 -> Master Pack
  const [activePassTab, setActivePassTab] = useState<'pass1' | 'pass2' | 'pass3' | 'meta'>('pass1');
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // App-wide AI settings synchronized reactively
  const [aiSettings, setAiSettings] = useState(() => getLocalAISettings(wedding.aiSettings));

  useEffect(() => {
    const handleUpdate = () => setAiSettings(getLocalAISettings(wedding.aiSettings));
    window.addEventListener(AI_SETTINGS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(AI_SETTINGS_UPDATED_EVENT, handleUpdate);
  }, [wedding.aiSettings]);

  // Collapsible sections state
  const [showInviteDetails, setShowInviteDetails] = useState<boolean>(true);
  const [showPass1Tweaks, setShowPass1Tweaks] = useState<boolean>(true);
  const [showPass2Tweaks, setShowPass2Tweaks] = useState<boolean>(true);
  const [showPass3Tweaks, setShowPass3Tweaks] = useState<boolean>(true);

  // Global & per-pass tweak options initialized with defaults
  const [tweakOptions, setTweakOptions] = useState<VideoPromptOptions>(() => getDefaultVideoPromptOptions());

  // Level 2 Drawer state for granular scene tweaking (tabbed by pass)
  const [editingScene, setEditingScene] = useState<VideoSceneStoryboard | null>(null);
  const [isSceneEditorOpen, setIsSceneEditorOpen] = useState<boolean>(false);
  const [activeSceneTab, setActiveSceneTab] = useState<'pass1' | 'pass2' | 'pass3' | 'inspector'>('pass2');
  const [activeVoiceoverTab, setActiveVoiceoverTab] = useState<'english' | 'hindi' | 'hinglish'>('english');

  // Auto-select first invite if none selected
  useEffect(() => {
    if (!selectedInviteId && invites && invites.length > 0) {
      setSelectedInviteId(invites[0].id);
    }
  }, [invites, selectedInviteId]);

  const activeInvite = useMemo(() => {
    return invites?.find((i) => i.id === selectedInviteId) || invites?.[0];
  }, [invites, selectedInviteId]);

  // Generated / restored prompt pack
  const [promptPack, setPromptPack] = useState<MultiPassVideoPromptPack | null>(null);

  // Track currently loaded invite ID to prevent infinite loops while restoring persisted config
  const loadedInviteIdRef = useRef<string | null>(null);

  // Restore persisted invite video configuration or generate baseline
  useEffect(() => {
    if (!activeInvite || !events) return;
    if (loadedInviteIdRef.current === activeInvite.id) return;

    loadedInviteIdRef.current = activeInvite.id;

    if (activeInvite.videoConfig) {
      const cfg = activeInvite.videoConfig;
      if (cfg.targetModel) setTargetModel(cfg.targetModel);
      if (cfg.tweakOptions) {
        setTweakOptions({ ...getDefaultVideoPromptOptions(), ...cfg.tweakOptions });
      }
      if (cfg.customInstructions !== undefined) {
        setCustomInstructions(cfg.customInstructions);
      }
      if (cfg.savedPromptPack) {
        setPromptPack(cfg.savedPromptPack);
        setSaveStatus('saved');
        return;
      }
    }

    // Generate baseline pack if none saved
    try {
      const initialModel = activeInvite.videoConfig?.targetModel || targetModel;
      const initialOptions = activeInvite.videoConfig?.tweakOptions
        ? { ...getDefaultVideoPromptOptions(), ...activeInvite.videoConfig.tweakOptions }
        : tweakOptions;

      const pack = generateAlgorithmicPromptPack(
        activeInvite,
        wedding,
        events,
        initialModel,
        initialOptions
      );
      setPromptPack(pack);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to generate baseline prompt pack', err);
    }
  }, [activeInvite?.id, events, wedding]);

  // Persist video configuration into Dexie IndexedDB under activeInvite.videoConfig
  const persistInviteConfig = async (
    overrideModel?: TargetVideoModel,
    overrideOptions?: VideoPromptOptions,
    overrideInstructions?: string,
    overridePromptPack?: MultiPassVideoPromptPack | null
  ) => {
    if (!activeInvite) return;
    setSaveStatus('saving');
    try {
      const targetM = overrideModel || targetModel;
      const opts = overrideOptions || tweakOptions;
      const instrs = overrideInstructions !== undefined ? overrideInstructions : customInstructions;
      const pack = overridePromptPack !== undefined ? overridePromptPack : promptPack;

      await db.eInvites.update(activeInvite.id, {
        videoConfig: {
          targetModel: targetM,
          tweakOptions: opts,
          customInstructions: instrs,
          savedPromptPack: pack || undefined,
          lastUpdatedAt: Date.now(),
        },
      });
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to persist video config for invite', err);
      setSaveStatus('unsaved');
    }
  };

  if (!isOpen) return null;

  const currentModelInfo = TARGET_VIDEO_MODELS.find((m) => m.id === targetModel);
  const hasConfiguredKey =
    Boolean(aiSettings.openaiApiKey && aiSettings.openaiApiKey.trim()) ||
    Boolean(aiSettings.geminiApiKey && aiSettings.geminiApiKey.trim()) ||
    Boolean(aiSettings.claudeApiKey && aiSettings.claudeApiKey.trim());

  // Included ceremonies in the current active invite
  const includedEvents = events?.filter((e) => activeInvite?.includedEventIds.includes(e.id)) || [];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTargetModelChange = (newModel: TargetVideoModel) => {
    setTargetModel(newModel);
    if (promptPack && activeInvite) {
      const reassembled = assembleMetaPrompt(
        wedding,
        activeInvite,
        newModel,
        promptPack.scenes,
        tweakOptions
      );
      const updatedPack = { ...promptPack, metaPromptForManualAI: reassembled };
      setPromptPack(updatedPack);
      persistInviteConfig(newModel, tweakOptions, customInstructions, updatedPack);
    } else {
      persistInviteConfig(newModel);
    }
  };

  const handleUpdateTweakOption = (key: keyof VideoPromptOptions, val: any) => {
    const updatedOptions = { ...tweakOptions, [key]: val };
    setTweakOptions(updatedOptions);

    if (promptPack && activeInvite) {
      const reassembled = assembleMetaPrompt(
        wedding,
        activeInvite,
        targetModel,
        promptPack.scenes,
        updatedOptions
      );
      const updatedPack = { ...promptPack, metaPromptForManualAI: reassembled };
      setPromptPack(updatedPack);
      persistInviteConfig(targetModel, updatedOptions, customInstructions, updatedPack);
    } else {
      persistInviteConfig(targetModel, updatedOptions);
    }
  };

  const handleToggleAccent = (accentId: string) => {
    const current = tweakOptions.culturalAccents || [];
    const updated = current.includes(accentId)
      ? current.filter((id) => id !== accentId)
      : [...current, accentId];
    handleUpdateTweakOption('culturalAccents', updated);
  };

  const handleRunAIGeneration = async () => {
    if (!activeInvite || !events) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const livePack = await executeMultiPassAIPipeline(
        activeInvite,
        wedding,
        events,
        targetModel,
        aiSettings,
        tweakOptions,
        customInstructions
      );
      setPromptPack(livePack);
      setActivePassTab('meta');
      persistInviteConfig(targetModel, tweakOptions, customInstructions, livePack);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          'Failed to communicate with AI API. Please verify your API key in Settings.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateBaseline = () => {
    if (!activeInvite || !events) return;
    const freshPack = generateAlgorithmicPromptPack(
      activeInvite,
      wedding,
      events,
      targetModel,
      tweakOptions
    );
    setPromptPack(freshPack);
    persistInviteConfig(targetModel, tweakOptions, customInstructions, freshPack);
  };

  // Open Level 2 Drawer for a specific scene with targeted tab
  const handleOpenSceneEditor = (
    scene: VideoSceneStoryboard,
    initialTab: 'pass1' | 'pass2' | 'pass3' | 'inspector' = 'pass2'
  ) => {
    setEditingScene({ ...scene });
    setActiveSceneTab(initialTab);
    setIsSceneEditorOpen(true);
  };

  // Re-synthesizes prompt strings for the currently editing scene based on its visual UI selections
  const syncEditingScenePrompts = (partialScene: Partial<VideoSceneStoryboard>) => {
    if (!editingScene) return;
    const merged = { ...editingScene, ...partialScene };

    // Resolve active FX prompt additions
    const fxAccents = (merged.activeFX || [])
      .map((id) => ATMOSPHERE_FX.find((f) => f.id === id)?.prompt)
      .filter(Boolean)
      .join(', ');

    const newPrompts = synthesizeScenePrompts(
      {
        visualAction: merged.visualAction,
        cameraMovement: merged.cameraMovement,
        lightingAndAtmosphere: merged.lightingAndAtmosphere,
        colorGrading: merged.colorGrading,
      },
      fxAccents
    );

    setEditingScene({
      ...merged,
      modelPrompts: newPrompts,
    });
  };

  const handleToggleSceneFX = (fxId: string) => {
    if (!editingScene) return;
    const current = editingScene.activeFX || [];
    const updated = current.includes(fxId)
      ? current.filter((id) => id !== fxId)
      : [...current, fxId];
    syncEditingScenePrompts({ activeFX: updated });
  };

  const handleSaveSceneChanges = () => {
    if (!editingScene || !promptPack || !activeInvite) return;

    const updatedScenes = promptPack.scenes.map((s) =>
      s.sceneNumber === editingScene.sceneNumber
        ? { ...editingScene, isCustomized: true }
        : s
    );

    const reassembledMeta = assembleMetaPrompt(
      wedding,
      activeInvite,
      targetModel,
      updatedScenes,
      tweakOptions
    );

    const updatedPack = {
      ...promptPack,
      scenes: updatedScenes,
      metaPromptForManualAI: reassembledMeta,
    };

    setPromptPack(updatedPack);
    setIsSceneEditorOpen(false);
    setEditingScene(null);
    persistInviteConfig(targetModel, tweakOptions, customInstructions, updatedPack);
  };

  const handleExportMarkdown = () => {
    if (!promptPack) return;
    const blob = new Blob([promptPack.metaPromptForManualAI], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wedding.brideName}-${wedding.groomName}-AI-Video-Prompts-${targetModel}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!promptPack) return;
    const jsonStr = JSON.stringify(promptPack, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wedding.brideName}-${wedding.groomName}-Storyboard.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeScene = promptPack?.scenes?.[activeSceneIndex] || promptPack?.scenes?.[0];

  return (
    <>
      {/* LEVEL 1 DRAWER: Main AI Video Studio */}
      <NestedScreen
        isOpen={isOpen}
        onClose={onClose}
        title="Multi-Pass AI Video Generation Studio"
        subtitle={`Synthesize cinematic video prompts and storyboards from E-Invite data for ${wedding.brideName} & ${wedding.groomName}`}
        mode="drawer"
        width="5xl"
        level={1}
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Export Markdown</span>
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (promptPack) {
                    handleCopy(promptPack.metaPromptForManualAI, 'copy_all');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                {copiedKey === 'copy_all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied All Prompts!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Master Prompt Pack</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-900 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-5 text-stone-800">
          {/* Top Controls: Invite Selector, Target Video Engine & Persistence Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-stone-700">Source E-Invite Variant</label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCheck className="w-3 h-3" />
                  <span>{saveStatus === 'saving' ? 'Saving...' : 'Auto-Saved to Invite'}</span>
                </span>
              </div>
              <CustomSelect
                value={selectedInviteId}
                onChange={(val) => {
                  loadedInviteIdRef.current = null;
                  setSelectedInviteId(val);
                }}
                options={
                  invites?.map((inv) => ({
                    value: inv.id,
                    label: inv.title,
                    description: `${inv.inviteType.replace('_', ' ')} • ${inv.slug}`,
                    badge: inv.videoConfig?.savedPromptPack ? 'Saved Config' : 'Baseline',
                  })) || []
                }
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-stone-700">Target AI Video Engine</label>
                <button
                  type="button"
                  onClick={openAIKeyManager}
                  className="inline-flex items-center gap-1 text-[10px] text-amber-800 hover:text-amber-950 underline font-medium"
                >
                  <KeyRound className="w-3 h-3 text-amber-600" />
                  <span>API Keys & Models</span>
                </button>
              </div>
              <CustomSelect
                value={targetModel}
                onChange={(val) => handleTargetModelChange(val as TargetVideoModel)}
                options={TARGET_VIDEO_MODELS.map((m) => ({
                  value: m.id,
                  label: m.name,
                  description: m.tagline,
                  badge: m.id.toUpperCase(),
                }))}
              />
            </div>
          </div>

          {/* SECTION 1: E-INVITE CONTEXT & METADATA BANNER */}
          {activeInvite && (
            <div className="rounded-2xl border border-stone-200 bg-white shadow-2xs relative">
              <div
                className={`px-4 py-3 flex items-center justify-between cursor-pointer border-b border-stone-100 hover:bg-stone-50/60 transition-colors rounded-t-2xl ${
                  !showInviteDetails ? 'rounded-b-2xl border-b-0' : ''
                }`}
                onClick={() => setShowInviteDetails(!showInviteDetails)}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: activeInvite.themeColors?.primary || '#7B1113' }}
                  />
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <span>E-Invite Context: {activeInvite.title}</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-800">
                        {activeInvite.inviteType.replace('_', ' ')}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-400">
                    {showInviteDetails ? 'Hide details' : 'Show details'}
                  </span>
                  {showInviteDetails ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>
              </div>

              {showInviteDetails && (
                <div className="p-4 space-y-3 bg-stone-50/40 text-xs rounded-b-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                        Cover Greeting
                      </span>
                      <span className="font-semibold text-stone-800 block truncate">
                        {activeInvite.coverGreeting || 'Shree Ganeshaya Namah'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                        Host Family
                      </span>
                      <span className="font-semibold text-stone-800 block truncate">
                        {activeInvite.hostFamilyNames || 'Sharma & Verma Families'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                        Couple Names
                      </span>
                      <span className="font-semibold text-stone-800 block truncate">
                        {wedding.brideName} & {wedding.groomName}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                        Palette & Motif
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: activeInvite.themeColors?.primary || '#7B1113' }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: activeInvite.themeColors?.secondary || '#D97706' }}
                          />
                        </div>
                        <span className="text-[11px] text-stone-600 truncate capitalize font-medium">
                          {activeInvite.backgroundTheme || 'royal_mandala'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Included Ceremonies Pills */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Included Ceremonies in this E-Invite ({includedEvents.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {includedEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px] shadow-2xs"
                        >
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span className="font-semibold text-stone-800">{evt.name}</span>
                          <span className="text-[10px] text-stone-500">
                            ({evt.date} • {evt.startTime || 'Muhurat'})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Generation Control Bar */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/70 via-white to-orange-50/50 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold text-stone-900">
                    Multi-Pass AI Generation Pipeline
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {aiSettings.preferredProvider?.toUpperCase() || 'GEMINI'} Engine
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Generate structured video prompts across narrative storyboarding, visual cinematography, and audio scoring.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerateBaseline}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                  title="Reset to algorithmic baseline"
                >
                  <RotateCcw className="w-3 h-3 text-stone-500" />
                  <span>Reset Baseline</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunAIGeneration}
                  disabled={isGenerating || !hasConfiguredKey}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7B1113] hover:bg-[#650e10] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>Running Multi-Pass AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Synthesize with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Custom Steering Instructions */}
            <div className="pt-2 border-t border-amber-100">
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => {
                  setCustomInstructions(e.target.value);
                  persistInviteConfig(targetModel, tweakOptions, e.target.value);
                }}
                placeholder="Optional AI steering prompt (e.g. 'Focus on royal Rajasthani heritage, evening pheras around holy fire, and emotional glances')..."
                className="w-full px-3 py-1.5 rounded-xl border border-amber-200 text-xs bg-white text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* SEQUENTIAL MULTI-PASS STAGE TABS: Pass 1 -> Pass 2 -> Pass 3 -> Master Pack */}
          <div className="border-b border-stone-200 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActivePassTab('pass1')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activePassTab === 'pass1'
                  ? 'bg-[#7B1113] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pass 1: Storyboard Narrative</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePassTab('pass2')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activePassTab === 'pass2'
                  ? 'bg-[#7B1113] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Pass 2: Visual & Camera Prompts</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePassTab('pass3')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activePassTab === 'pass3'
                  ? 'bg-[#7B1113] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Pass 3: Voiceover & Audio Score</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePassTab('meta')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activePassTab === 'meta'
                  ? 'bg-[#7B1113] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Master AI Prompt Pack</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PASS 1 - NARRATIVE STORYBOARD & THEMATIC TWEAKS                     */}
          {/* ========================================================================= */}
          {activePassTab === 'pass1' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Pass 1 Specific Tweak Section: Story Arc, Theme & Accents */}
              <div className="rounded-2xl border border-stone-200 bg-white shadow-2xs relative">
                <div
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer border-b border-stone-100 hover:bg-stone-50/60 transition-colors rounded-t-2xl ${
                    !showPass1Tweaks ? 'rounded-b-2xl border-b-0' : ''
                  }`}
                  onClick={() => setShowPass1Tweaks(!showPass1Tweaks)}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-stone-900">
                      Pass 1 Tweaks: Narrative Arc, Style & Cultural Story Beats
                    </h3>
                  </div>
                  {showPass1Tweaks ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>

                {showPass1Tweaks && (
                  <div className="p-4 space-y-4 bg-stone-50/30 text-xs rounded-b-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <CustomSelect
                          label="Visual Cinematic Theme"
                          value={tweakOptions.visualStyle || 'royal_heritage'}
                          onChange={(val) => handleUpdateTweakOption('visualStyle', val)}
                          options={VISUAL_STYLES.map((s) => ({
                            value: s.id,
                            label: s.label,
                            description: s.desc,
                          }))}
                        />
                      </div>

                      <div>
                        <CustomSelect
                          label="Story Progression Pacing"
                          value={tweakOptions.pacingPreset || 'slow_motion'}
                          onChange={(val) => handleUpdateTweakOption('pacingPreset', val)}
                          options={PACING_PRESETS.map((p) => ({
                            value: p.id,
                            label: p.label,
                            description: p.desc,
                          }))}
                        />
                      </div>
                    </div>

                    {/* Cultural Accents Toggle Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Cultural Ritual & Festive Elements (Toggle to include in story arc)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {CULTURAL_ACCENTS_LIST.map((accent) => {
                          const isSelected = tweakOptions.culturalAccents?.includes(accent.id);
                          return (
                            <button
                              key={accent.id}
                              type="button"
                              onClick={() => handleToggleAccent(accent.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                                isSelected
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-amber-200'
                              }`}
                            >
                              <span>{accent.icon}</span>
                              <span>{accent.label}</span>
                              {isSelected && <Check className="w-3 h-3 text-amber-700 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Narrative Guidance Notes */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Storyboard Narrative Guidance & Emotional Arc
                      </label>
                      <textarea
                        rows={2}
                        value={tweakOptions.narrativeNotes || ''}
                        onChange={(e) => handleUpdateTweakOption('narrativeNotes', e.target.value)}
                        placeholder="Add notes for the overall storytelling arc (e.g. 'Build suspense from the bride's anticipation in Mehendi to the joyous climax of the Baraat entry')..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Narrative Storyboard Arc Summary */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[11px] uppercase tracking-wider text-amber-800 mb-0.5">
                    Synthesized Storyboard Arc:
                  </strong>
                  <span>{promptPack?.pass1_narrativeSummary}</span>
                </div>
              </div>

              {/* Scene-by-Scene Narrative Breakdown Cards */}
              <div className="space-y-3">
                {promptPack?.scenes.map((s, idx) => (
                  <div
                    key={s.sceneNumber}
                    className="p-4 rounded-xl border border-stone-200 bg-white space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#7B1113] text-white text-xs font-bold flex items-center justify-center">
                          {s.sceneNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{s.title}</h4>
                          {s.ceremonyType && (
                            <span className="text-[10px] text-amber-700 font-medium">
                              {s.ceremonyType}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {s.durationSeconds}s
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenSceneEditor(s, 'pass1')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3 text-amber-700" />
                          <span>Tweak Narrative</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed bg-stone-50/60 p-2.5 rounded-lg border border-stone-100">
                      {s.visualAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PASS 2 - VISUAL & CAMERA PROMPTS & OPTICS TWEAKS                   */}
          {/* ========================================================================= */}
          {activePassTab === 'pass2' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Pass 2 Specific Tweak Section: Lens Signature, Lighting & Color */}
              <div className="rounded-2xl border border-stone-200 bg-white shadow-2xs relative">
                <div
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer border-b border-stone-100 hover:bg-stone-50/60 transition-colors rounded-t-2xl ${
                    !showPass2Tweaks ? 'rounded-b-2xl border-b-0' : ''
                  }`}
                  onClick={() => setShowPass2Tweaks(!showPass2Tweaks)}
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-stone-900">
                      Pass 2 Tweaks: Cinematography, Lens Signature & Lighting Physics
                    </h3>
                  </div>
                  {showPass2Tweaks ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>

                {showPass2Tweaks && (
                  <div className="p-4 space-y-4 bg-stone-50/30 text-xs rounded-b-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <CustomSelect
                          label="Lens & Camera Signature"
                          value={tweakOptions.lensPreset || '35mm_anamorphic'}
                          onChange={(val) => handleUpdateTweakOption('lensPreset', val)}
                          options={LENS_PRESETS.map((l) => ({
                            value: l.id,
                            label: l.label,
                            description: l.desc,
                          }))}
                        />
                      </div>

                      <div>
                        <CustomSelect
                          label="Lighting & Atmospheric Physics"
                          value={tweakOptions.lightingPreset || 'golden_hour'}
                          onChange={(val) => handleUpdateTweakOption('lightingPreset', val)}
                          options={LIGHTING_PRESETS.map((l) => ({
                            value: l.id,
                            label: l.label,
                            description: l.desc,
                          }))}
                        />
                      </div>

                      <div>
                        <CustomSelect
                          label="Global Color Grading Palette"
                          value={tweakOptions.colorTonePreset || 'royal_crimson'}
                          onChange={(val) => handleUpdateTweakOption('colorTonePreset', val)}
                          options={COLOR_TONES.map((t) => ({
                            value: t.id,
                            label: t.label,
                            description: t.desc,
                          }))}
                        />
                      </div>
                    </div>

                    {/* Target Model Format Guidelines Card */}
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 bg-white shadow-2xs">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{currentModelInfo?.name} Cinematic Directives</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">
                            {targetModel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {currentModelInfo?.formatGuide}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scene Selector Ribbon */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {promptPack?.scenes.map((s, idx) => (
                  <button
                    key={s.sceneNumber}
                    type="button"
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all flex items-center gap-1.5 ${
                      activeSceneIndex === idx
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'
                    }`}
                  >
                    <span>
                      Scene {s.sceneNumber}: {s.title}
                    </span>
                    {s.isCustomized && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Customized" />
                    )}
                  </button>
                ))}
              </div>

              {activeScene && (
                <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-sm">
                  {/* Scene Header with Live Config Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Scene {activeScene.sceneNumber} &bull; {activeScene.durationSeconds}s
                        </span>
                        {activeScene.shotType && (
                          <span className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                            {SHOT_TYPES.find((s) => s.id === activeScene.shotType)?.icon}{' '}
                            {SHOT_TYPES.find((s) => s.id === activeScene.shotType)?.label}
                          </span>
                        )}
                        {activeScene.isCustomized && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Custom Tweaks Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-base text-stone-900">
                        {activeScene.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* LEVEL 2 TRIGGER BUTTON: Visual Configurator */}
                      <button
                        type="button"
                        onClick={() => handleOpenSceneEditor(activeScene, 'pass2')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200 text-xs font-bold text-amber-900 transition-all shadow-2xs hover:shadow-xs"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-800" />
                        <span>Tweak Scene Visually</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            activeScene.modelPrompts[targetModel],
                            `scene_${activeScene.sceneNumber}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-xs font-semibold text-stone-700 transition-colors shadow-2xs"
                      >
                        {copiedKey === `scene_${activeScene.sceneNumber}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Prompt Codebox */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      {targetModel.toUpperCase()} Ready Prompt
                    </label>
                    <div className="relative">
                      <pre className="p-3.5 rounded-xl bg-stone-900 text-amber-300 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                        {activeScene.modelPrompts[targetModel]}
                      </pre>
                    </div>
                  </div>

                  {/* Visual Directives Cards with Icons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase">
                        <Camera className="w-3 h-3 text-blue-600" />
                        <span>Camera Move</span>
                      </div>
                      <span className="text-stone-800 font-medium block leading-snug">
                        {activeScene.cameraMovement}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase">
                        <Sun className="w-3 h-3 text-amber-600" />
                        <span>Lighting & Atmosphere</span>
                      </div>
                      <span className="text-stone-800 font-medium block leading-snug">
                        {activeScene.lightingAndAtmosphere}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase">
                        <Palette className="w-3 h-3 text-purple-600" />
                        <span>Color Grading</span>
                      </div>
                      <span className="text-stone-800 font-medium block leading-snug">
                        {activeScene.colorGrading}
                      </span>
                    </div>
                  </div>

                  {/* Active Atmospheric FX Badges */}
                  {activeScene.activeFX && activeScene.activeFX.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">
                        Atmospheric FX:
                      </span>
                      {activeScene.activeFX.map((fxId) => {
                        const fx = ATMOSPHERE_FX.find((f) => f.id === fxId);
                        if (!fx) return null;
                        return (
                          <span
                            key={fxId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-900"
                          >
                            <span>{fx.icon}</span>
                            <span>{fx.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PASS 3 - VOICEOVER, AUDIO SCORE & FOLEY TWEAKS                     */}
          {/* ========================================================================= */}
          {activePassTab === 'pass3' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Pass 3 Specific Tweak Section: Language, Score & Foley */}
              <div className="rounded-2xl border border-stone-200 bg-white shadow-2xs relative">
                <div
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer border-b border-stone-100 hover:bg-stone-50/60 transition-colors rounded-t-2xl ${
                    !showPass3Tweaks ? 'rounded-b-2xl border-b-0' : ''
                  }`}
                  onClick={() => setShowPass3Tweaks(!showPass3Tweaks)}
                >
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-stone-900">
                      Pass 3 Tweaks: Multilingual Narration Language, Acoustic Score & Foley
                    </h3>
                  </div>
                  {showPass3Tweaks ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>

                {showPass3Tweaks && (
                  <div className="p-4 space-y-4 bg-stone-50/30 text-xs rounded-b-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Language Selection Buttons */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Primary Voiceover Language
                        </label>
                        <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                          {(['english', 'hindi', 'hinglish'] as const).map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => handleUpdateTweakOption('voLanguage', lang)}
                              className={`py-1 text-[11px] font-bold rounded-lg transition-colors capitalize ${
                                tweakOptions.voLanguage === lang
                                  ? 'bg-white text-stone-900 shadow-2xs'
                                  : 'text-stone-500 hover:text-stone-800'
                              }`}
                            >
                              {lang === 'hindi' ? 'हिंदी' : lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Musical Score Preset */}
                      <div>
                        <CustomSelect
                          label="Primary Acoustic Score"
                          value={tweakOptions.musicPreset || 'shehnai_santoor'}
                          onChange={(val) => handleUpdateTweakOption('musicPreset', val)}
                          options={AUDIO_MOODS.map((m) => ({
                            value: m.id,
                            label: m.label,
                            description: m.cue,
                          }))}
                        />
                      </div>

                      {/* Ambient Foley Preset */}
                      <div>
                        <CustomSelect
                          label="Ambient Foley & Sacred Sound"
                          value={tweakOptions.foleyPreset || 'temple_bells'}
                          onChange={(val) => handleUpdateTweakOption('foleyPreset', val)}
                          options={FOLEY_PRESETS.map((f) => ({
                            value: f.id,
                            label: f.label,
                            description: f.desc,
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scene-by-Scene Audio & Script Cards */}
              <div className="space-y-3">
                {promptPack?.scenes.map((s) => (
                  <div
                    key={s.sceneNumber}
                    className="p-4 rounded-xl border border-stone-200 bg-white space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center">
                          {s.sceneNumber}
                        </span>
                        <h4 className="font-bold text-xs text-stone-900">{s.title}</h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenSceneEditor(s, 'pass3')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-300 bg-purple-50 text-[11px] font-bold text-purple-900 hover:bg-purple-100 transition-colors shadow-2xs"
                      >
                        <Volume2 className="w-3 h-3 text-purple-700" />
                        <span>Tweak Scene Audio</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-100 space-y-1">
                        <span className="font-bold text-[10px] text-purple-800 uppercase block">
                          Musical Score Directive
                        </span>
                        <p className="text-stone-700 leading-snug">{s.audioCue}</p>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 space-y-1">
                        <span className="font-bold text-[10px] text-stone-500 uppercase block">
                          Voiceover ({tweakOptions.voLanguage || 'english'})
                        </span>
                        <p className="text-stone-800 italic leading-snug font-serif">
                          "{s.voiceoverNarration[tweakOptions.voLanguage || 'english']}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MASTER AI PROMPT PACK                                              */}
          {/* ========================================================================= */}
          {activePassTab === 'meta' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 border border-stone-200">
                <span className="text-xs font-bold text-stone-700">
                  Master Prompt Pack for {targetModel.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (promptPack) {
                      handleCopy(promptPack.metaPromptForManualAI, 'copy_master_tab');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7B1113] text-white text-xs font-bold hover:bg-[#650e10] transition-colors shadow-2xs"
                >
                  {copiedKey === 'copy_master_tab' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-stone-900 text-stone-200 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner max-h-[500px] overflow-y-auto">
                {promptPack?.metaPromptForManualAI}
              </pre>
            </div>
          )}
        </div>
      </NestedScreen>

      {/* ========================================================================= */}
      {/* LEVEL 2 DRAWER: GRANULAR SCENE TWEAKING (TABBED BY PASS)                  */}
      {/* ========================================================================= */}
      {editingScene && (
        <NestedScreen
          isOpen={isSceneEditorOpen}
          onClose={() => setIsSceneEditorOpen(false)}
          title={`Tweak Scene ${editingScene.sceneNumber}: ${editingScene.title}`}
          subtitle={`Granular pass-by-pass control for optics, narrative action, camera rig physics, and multilingual voiceover`}
          mode="drawer"
          width="5xl"
          level={2}
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  const fxAccents = (editingScene.activeFX || [])
                    .map((id) => ATMOSPHERE_FX.find((f) => f.id === id)?.prompt)
                    .filter(Boolean)
                    .join(', ');

                  const newPrompts = synthesizeScenePrompts(
                    {
                      visualAction: editingScene.visualAction,
                      cameraMovement: editingScene.cameraMovement,
                      lightingAndAtmosphere: editingScene.lightingAndAtmosphere,
                      colorGrading: editingScene.colorGrading,
                    },
                    fxAccents
                  );

                  setEditingScene({
                    ...editingScene,
                    modelPrompts: newPrompts,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Re-Synthesize Model Prompts</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSceneEditorOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSceneChanges}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Apply Tweaks</span>
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs text-stone-800">
            {/* LEVEL 2 TAB NAVIGATION: Pass 1, Pass 2, Pass 3, and Compiled Prompt */}
            <div className="border-b border-stone-200 flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveSceneTab('pass1')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeSceneTab === 'pass1'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Pass 1: Narrative & Duration</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSceneTab('pass2')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeSceneTab === 'pass2'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Pass 2: Cinematography & Rig</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSceneTab('pass3')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeSceneTab === 'pass3'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Pass 3: Audio & Scripts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSceneTab('inspector')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeSceneTab === 'inspector'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Compiled Prompt Inspector</span>
              </button>
            </div>

            {/* TAB 1: PASS 1 NARRATIVE & ACTION */}
            {activeSceneTab === 'pass1' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Scene Title
                    </label>
                    <input
                      type="text"
                      value={editingScene.title}
                      onChange={(e) => setEditingScene({ ...editingScene, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Ceremony Linkage
                    </label>
                    <input
                      type="text"
                      value={editingScene.ceremonyType || ''}
                      onChange={(e) => setEditingScene({ ...editingScene, ceremonyType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
                      placeholder="e.g. Sangeet, Mehendi, Pheras..."
                    />
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Scene Duration
                    </label>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
                      {editingScene.durationSeconds} Seconds
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={15}
                    step={1}
                    value={editingScene.durationSeconds}
                    onChange={(e) =>
                      setEditingScene({
                        ...editingScene,
                        durationSeconds: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>3s (Snappy)</span>
                    <span>5s (Standard)</span>
                    <span>8s (Cinematic)</span>
                    <span>15s (Epic)</span>
                  </div>
                </div>

                {/* Narrative Action Description Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Visual Action & Narrative Subject (Editable)
                  </label>
                  <textarea
                    rows={4}
                    value={editingScene.visualAction}
                    onChange={(e) =>
                      syncEditingScenePrompts({ visualAction: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs leading-relaxed text-stone-800"
                    placeholder="Describe the action and emotional gestures..."
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PASS 2 CINEMATOGRAPHY & RIG */}
            {activeSceneTab === 'pass2' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* 1. SHOT FRAMING */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    1. Shot Framing & Scale
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SHOT_TYPES.map((shot) => {
                      const isSelected = editingScene.shotType === shot.id;
                      return (
                        <button
                          key={shot.id}
                          type="button"
                          onClick={() => syncEditingScenePrompts({ shotType: shot.id })}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-xs ring-1 ring-amber-400'
                              : 'border-stone-200 bg-white hover:border-amber-200 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-base">{shot.icon}</span>
                            {isSelected && <Check className="w-3 h-3 text-amber-700" />}
                          </div>
                          <span className="font-bold text-[11px] leading-tight block">{shot.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. CAMERA MOVEMENT & RIG DYNAMICS */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    2. Camera Movement & Rig Dynamics
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CAMERA_MOTIONS.map((motion) => {
                      const isSelected = editingScene.cameraMotionId === motion.id;
                      return (
                        <button
                          key={motion.id}
                          type="button"
                          onClick={() =>
                            syncEditingScenePrompts({
                              cameraMotionId: motion.id,
                              cameraMovement: motion.directive,
                            })
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-950 shadow-xs ring-1 ring-blue-400'
                              : 'border-stone-200 bg-white hover:border-blue-200 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{motion.icon}</span>
                            {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                          </div>
                          <span className="font-bold text-[11px] block">{motion.label}</span>
                          <span className="text-[10px] text-stone-500 block mt-0.5 leading-snug">
                            {motion.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. LIGHTING ATMOSPHERE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    3. Lighting & Atmospheric Physics
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {LIGHTING_CONFIGS.map((light) => {
                      const isSelected = editingScene.lightingId === light.id;
                      return (
                        <button
                          key={light.id}
                          type="button"
                          onClick={() =>
                            syncEditingScenePrompts({
                              lightingId: light.id,
                              lightingAndAtmosphere: light.directive,
                            })
                          }
                          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-1 ring-amber-400'
                              : 'border-stone-200 bg-white hover:border-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{light.icon}</span>
                              <span className="font-bold text-[11px] text-stone-900">{light.label}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-amber-700" />}
                          </div>
                          <div
                            className="h-1.5 rounded-full w-full mb-1.5 shadow-2xs"
                            style={{
                              background: `linear-gradient(to right, ${light.colorFrom}, ${light.colorTo})`,
                            }}
                          />
                          <span className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed">
                            {light.directive}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. MOTION PACING & COLOR GRADING */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Motion Pacing */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Motion Pacing & Frame Rate
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PACING_CONFIGS.map((pacing) => {
                        const isSelected = editingScene.pacingId === pacing.id;
                        return (
                          <button
                            key={pacing.id}
                            type="button"
                            onClick={() => syncEditingScenePrompts({ pacingId: pacing.id })}
                            className={`p-2 rounded-lg border text-left transition-all ${
                              isSelected
                                ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-bold'
                                : 'bg-white border-stone-200 text-stone-600'
                            }`}
                          >
                            <div className="text-[10px] flex items-center justify-between">
                              <span>{pacing.label}</span>
                              {isSelected && <Check className="w-2.5 h-2.5 text-amber-700" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Grading Palette */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Color Grading Palette
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {COLOR_TONES.slice(0, 3).map((tone) => {
                        const isSelected = editingScene.colorToneId === tone.id;
                        return (
                          <button
                            key={tone.id}
                            type="button"
                            onClick={() =>
                              syncEditingScenePrompts({
                                colorToneId: tone.id,
                                colorGrading: tone.desc,
                              })
                            }
                            className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs ring-1 ring-amber-400'
                                : 'border-stone-200 bg-white hover:border-amber-200 text-stone-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex items-center -space-x-1">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                                  style={{ backgroundColor: tone.primary }}
                                />
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                                  style={{ backgroundColor: tone.secondary }}
                                />
                              </div>
                              <span className="font-semibold text-[11px]">{tone.label}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-amber-700" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 5. ATMOSPHERIC PARTICLE & CULTURAL FX */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    5. Atmospheric Particle & Cultural FX (Toggle)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ATMOSPHERE_FX.map((fx) => {
                      const isSelected = editingScene.activeFX?.includes(fx.id);
                      return (
                        <button
                          key={fx.id}
                          type="button"
                          onClick={() => handleToggleSceneFX(fx.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-100 text-amber-950 shadow-2xs'
                              : 'border-stone-200 bg-white text-stone-600 hover:border-amber-200'
                          }`}
                        >
                          <span>{fx.icon}</span>
                          <span>{fx.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-amber-700 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PASS 3 AUDIO & MULTILINGUAL SCRIPTS */}
            {activeSceneTab === 'pass3' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Acoustic Musical Score Cue */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Acoustic & Musical Score Cue
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AUDIO_MOODS.map((audio) => {
                      const isSelected = editingScene.audioMoodId === audio.id;
                      return (
                        <button
                          key={audio.id}
                          type="button"
                          onClick={() =>
                            syncEditingScenePrompts({
                              audioMoodId: audio.id,
                              audioCue: audio.cue,
                            })
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 text-purple-950 shadow-2xs ring-1 ring-purple-400'
                              : 'border-stone-200 bg-white hover:border-purple-200 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{audio.icon}</span>
                              <span className="font-bold text-[11px] text-stone-900">{audio.label}</span>
                            </div>
                            {isSelected && <Check className="w-3 h-3 text-purple-700" />}
                          </div>
                          <span className="text-[10px] text-stone-600 leading-snug block line-clamp-2">
                            {audio.cue}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Multilingual Voiceover Scripts Editor */}
                <div className="space-y-2 pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Voiceover Narration Script
                    </label>
                    <div className="flex gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                      {(['english', 'hindi', 'hinglish'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setActiveVoiceoverTab(lang)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize transition-colors ${
                            activeVoiceoverTab === lang
                              ? 'bg-white text-stone-900 shadow-2xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          {lang === 'hindi' ? 'शुद्ध हिंदी' : lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeVoiceoverTab === 'english' && (
                    <textarea
                      rows={3}
                      value={editingScene.voiceoverNarration.english}
                      onChange={(e) =>
                        setEditingScene({
                          ...editingScene,
                          voiceoverNarration: {
                            ...editingScene.voiceoverNarration,
                            english: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
                      placeholder="English voiceover narration..."
                    />
                  )}

                  {activeVoiceoverTab === 'hindi' && (
                    <textarea
                      rows={3}
                      value={editingScene.voiceoverNarration.hindi}
                      onChange={(e) =>
                        setEditingScene({
                          ...editingScene,
                          voiceoverNarration: {
                            ...editingScene.voiceoverNarration,
                            hindi: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-serif text-stone-800"
                      placeholder="हिंदी वॉइसओवर..."
                    />
                  )}

                  {activeVoiceoverTab === 'hinglish' && (
                    <textarea
                      rows={3}
                      value={editingScene.voiceoverNarration.hinglish}
                      onChange={(e) =>
                        setEditingScene({
                          ...editingScene,
                          voiceoverNarration: {
                            ...editingScene.voiceoverNarration,
                            hinglish: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
                      placeholder="Hinglish voiceover..."
                    />
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: COMPILED PROMPT INSPECTOR */}
            {activeSceneTab === 'inspector' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Live {targetModel.toUpperCase()} Generated Prompt (Real-Time Synchronized)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        editingScene.modelPrompts[targetModel],
                        'scene_editor_copy'
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    {copiedKey === 'scene_editor_copy' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={editingScene.modelPrompts[targetModel]}
                  onChange={(e) =>
                    setEditingScene({
                      ...editingScene,
                      modelPrompts: {
                        ...editingScene.modelPrompts,
                        [targetModel]: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3.5 rounded-xl bg-stone-900 text-amber-300 font-mono text-xs leading-relaxed border border-stone-700 shadow-inner"
                />

                {/* Directives Summary Table */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="font-bold text-[10px] uppercase text-stone-400 block">Framing</span>
                    <span className="text-stone-800 font-medium">
                      {SHOT_TYPES.find((s) => s.id === editingScene.shotType)?.label || 'Medium'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[10px] uppercase text-stone-400 block">Camera Motion</span>
                    <span className="text-stone-800 font-medium">
                      {CAMERA_MOTIONS.find((m) => m.id === editingScene.cameraMotionId)?.label || '360° Orbit'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[10px] uppercase text-stone-400 block">Lighting</span>
                    <span className="text-stone-800 font-medium">
                      {LIGHTING_CONFIGS.find((l) => l.id === editingScene.lightingId)?.label || 'Golden Hour'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[10px] uppercase text-stone-400 block">FX Count</span>
                    <span className="text-stone-800 font-medium">
                      {editingScene.activeFX?.length || 0} Active Particle FX
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </NestedScreen>
      )}
    </>
  );
};
