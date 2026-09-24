import { EInvite, Wedding, WeddingEvent, WeddingAISettings } from '../db/schema';
import { callAICompletion } from './aiService';

export type TargetVideoModel = 'sora' | 'runway_gen3' | 'luma_dream' | 'google_veo' | 'pika';

export interface VideoPromptOptions {
  visualStyle?: string;
  lensPreset?: string;
  lightingPreset?: string;
  pacingPreset?: string;
  culturalAccents?: string[];
  voLanguage?: 'english' | 'hindi' | 'hinglish';
  customNotes?: string;
  // Pass 1 Specific Tweaks
  narrativeNotes?: string;
  storyArc?: 'chronological' | 'emotional_climax' | 'romantic_candid';
  // Pass 2 Specific Tweaks
  colorTonePreset?: string;
  // Pass 3 Specific Tweaks
  musicPreset?: string;
  foleyPreset?: string;
}

export const FOLEY_PRESETS = [
  { id: 'temple_bells', label: 'Temple Bells & Conch Shell', desc: 'Resonant brass bells, sacred shankhnaad conch drone, and gentle floral breeze' },
  { id: 'baraat_dhol', label: 'Baraat Dhol & Festive Cheers', desc: 'Resonant bass dhol beats, joyous cheering, whistling, and live brass fanfare' },
  { id: 'sacred_havan', label: 'Sacred Agni & Wood Crackle', desc: 'Subtle crackling of sandalwood embers, ghee offering sound, and rhythmic Vedic mantras' },
  { id: 'palace_fountains', label: 'Courtyard Fountains & Peacocks', desc: 'Tranquil splashing water in royal marble courtyards with distant call of peacocks' },
];

export const getDefaultVideoPromptOptions = (): VideoPromptOptions => ({
  visualStyle: 'royal_heritage',
  lensPreset: '35mm_anamorphic',
  lightingPreset: 'golden_hour',
  pacingPreset: 'slow_motion',
  culturalAccents: ['petals', 'sparklers', 'diyas'],
  voLanguage: 'english',
  customNotes: '',
  narrativeNotes: '',
  storyArc: 'chronological',
  colorTonePreset: 'royal_crimson',
  musicPreset: 'shehnai_santoor',
  foleyPreset: 'temple_bells',
});

export interface VideoSceneStoryboard {
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  ceremonyType?: string;
  visualAction: string;
  cameraMovement: string;
  lightingAndAtmosphere: string;
  colorGrading: string;
  voiceoverNarration: {
    english: string;
    hindi: string;
    hinglish: string;
  };
  audioCue: string;
  modelPrompts: Record<TargetVideoModel, string>;
  isCustomized?: boolean;
  // Visual UI Configurations
  shotType?: string;
  cameraMotionId?: string;
  lightingId?: string;
  lensId?: string;
  pacingId?: string;
  activeFX?: string[];
  audioMoodId?: string;
  colorToneId?: string;
}

export interface MultiPassVideoPromptPack {
  weddingTitle: string;
  coupleNames: string;
  targetModel: TargetVideoModel;
  options: VideoPromptOptions;
  pass1_narrativeSummary: string;
  pass2_cameraAestheticDirective: string;
  pass3_soundAndVoiceoverMaster: string;
  scenes: VideoSceneStoryboard[];
  metaPromptForManualAI: string;
}

export const TARGET_VIDEO_MODELS: {
  id: TargetVideoModel;
  name: string;
  tagline: string;
  formatGuide: string;
}[] = [
  {
    id: 'sora',
    name: 'OpenAI Sora',
    tagline: 'Hyper-realistic physics, photorealistic lighting, and seamless continuous shots',
    formatGuide: 'Ultra-detailed narrative prompt with explicit depth of field, 35mm lens, physical materials, and volumetric lighting.',
  },
  {
    id: 'runway_gen3',
    name: 'Runway Gen-3 Alpha',
    tagline: 'High cinematic fidelity, explicit camera motion control tags',
    formatGuide: 'Structured format using [Camera Move], [Subject Action], [Atmosphere & Lighting], [Style / 35mm], [Speed].',
  },
  {
    id: 'luma_dream',
    name: 'Luma Dream Machine',
    tagline: 'Dynamic motion transitions, smooth slow-motion aesthetics',
    formatGuide: 'Natural prose describing flow, lighting temperature, and fluid physical motion without cluttered keywords.',
  },
  {
    id: 'google_veo',
    name: 'Google Veo',
    tagline: 'High-definition 1080p, nuanced understanding of cultural attire & complex rituals',
    formatGuide: 'Rich cultural specificity (zari brocade, marigold garland, havan agni, lehenga flare) with cinematic lens directives.',
  },
  {
    id: 'pika',
    name: 'Pika Labs',
    tagline: 'Dynamic camera zooms, particle effects, and high-energy motion',
    formatGuide: 'Direct command structure with camera parameters (-camera zoom in, -fps 24, -motion 5).',
  },
];

export const VISUAL_STYLES = [
  { id: 'royal_heritage', label: 'Heritage Royal Palace', desc: 'Rajasthani grandeur, carved sandstone arches, royal crimson velvet' },
  { id: 'bollywood_glam', label: 'Modern Bollywood Glamour', desc: 'Sparkling chandeliers, sequined couture, dynamic pyrotechnics' },
  { id: 'sufi_candlelight', label: 'Intimate Candlelit Sufi', desc: 'Deep warm amber tones, hundreds of brass diyas, sacred calm' },
  { id: 'pastel_fairytale', label: 'Pastel Garden Fairytale', desc: 'Floral arbors, soft romantic bokeh, blush and ivory silks' },
  { id: 'vintage_16mm', label: 'Vintage 16mm Film', desc: 'Nostalgic film grain, warm Kodak vintage saturation, timeless emotion' },
  { id: 'high_fashion', label: 'Avant-Garde High Fashion', desc: 'Dramatic editorial contrast, high-fashion silhouettes and drapery' },
];

export const LENS_PRESETS = [
  { id: '35mm_anamorphic', label: '35mm Anamorphic Lens', desc: 'Cinematic 2.39:1 widescreen, warm horizontal lens flares, oval bokeh' },
  { id: '50mm_prime', label: '50mm Prime (f/1.2)', desc: 'Ultra-shallow depth of field, creamy background blur, emotional portraiture' },
  { id: 'aerial_drone', label: 'Sweeping Drone & Crane', desc: 'High-angle establishing sweeps, grand palace courtyards and lakes' },
  { id: 'steadicam_orbit', label: 'Steadicam 360° Orbit', desc: 'Smooth continuous camera orbit wrapping around the couple and rituals' },
  { id: 'macro_probe', label: 'Macro Detail Lens', desc: 'Extreme closeups of henna embroidery, gold jewelry sparkle and silk textures' },
];

export const LIGHTING_PRESETS = [
  { id: 'golden_hour', label: 'Golden Hour Sunrise/Dusk', desc: 'Volumetric sunbeams, warm amber rays and dust particles in air' },
  { id: 'sacred_firelight', label: 'Sacred Agni Firelight', desc: 'Dancing orange flames, flickering oil diyas, sacred smoke highlights' },
  { id: 'tungsten_chandeliers', label: 'Crystal Chandeliers & Tungsten', desc: 'Opulent ballroom warm indoor glow, shimmering glass reflections' },
  { id: 'high_key_daylight', label: 'High-Key Sunlit Lawns', desc: 'Bright festive daylight, vivid saturation, crisp shadows' },
  { id: 'starlit_night', label: 'Starlit Sky & Cold Sparklers', desc: 'Midnight indigo sky, glistening gold sparklers and fairy lights' },
];

export const PACING_PRESETS = [
  { id: 'slow_motion', label: 'Dreamy Slow-Motion (60/120fps)', desc: 'Hypnotic petal fall, slow-motion smiles and fabric flow' },
  { id: 'cinematic_24fps', label: 'Cinematic Standard (24fps)', desc: 'Natural filmic cadence with authentic motion blur' },
  { id: 'speed_ramped', label: 'Dynamic Speed-Ramped', desc: 'Rhythmic acceleration matching sangeet beats and dhol drops' },
  { id: 'lyrical_flow', label: 'Lyrical & Gentle Glide', desc: 'Smooth perpetual camera movement without abrupt cuts' },
];

export const CULTURAL_ACCENTS_LIST = [
  { id: 'petals', label: 'Petal Showers', icon: '🌸', promptText: 'cascading showers of fresh red rose and golden marigold petals' },
  { id: 'smoke', label: 'Sandalwood Mist', icon: '💨', promptText: 'delicate curls of fragrant sandalwood incense and sacred havan smoke' },
  { id: 'sparklers', label: 'Gold Sparklers', icon: '✨', promptText: 'crackling cold golden fireworks sparklers catching in background' },
  { id: 'diyas', label: 'Brass Diyas', icon: '🪔', promptText: 'rows of flickering brass oil lamps and floating diya candles on water' },
  { id: 'zari', label: 'Zari Shimmer', icon: '🧵', promptText: 'shimmering real gold and silver metallic zari embroidery reflecting light' },
  { id: 'shehnai', label: 'Shehnai & Dhol', icon: '🎺', promptText: 'traditional brass shehnai and engraved wooden dhol drum visuals' },
];

// ==========================================
// VISUAL SCENE UI CONFIGURATION DICTIONARIES
// ==========================================

export const SHOT_TYPES = [
  {
    id: 'wide_establishing',
    label: 'Wide Establishing',
    icon: '🏰',
    promptSnippet: 'Extreme wide cinematic establishing view showcasing grand palace architecture, reflections on courtyard fountains, and royal atmosphere.',
  },
  {
    id: 'medium_couple',
    label: 'Medium Couple',
    icon: '👥',
    promptSnippet: 'Medium cinematic shot framing bride and groom together surrounded by smiling family members in royal attire.',
  },
  {
    id: 'close_up',
    label: 'Close-Up Portrait',
    icon: '✨',
    promptSnippet: 'Intimate close-up portrait with creamy bokeh, capturing genuine emotional smiles and heartfelt glances.',
  },
  {
    id: 'macro_detail',
    label: 'Extreme Macro',
    icon: '🔍',
    promptSnippet: 'Macro detail 1:1 probe closeup of intricate henna peacocks, shimmering gold jewelry, and woven zari threads.',
  },
  {
    id: 'orbital_360',
    label: '360° Orbital',
    icon: '🔄',
    promptSnippet: 'Dynamic continuous 360-degree orbital shot wrapping smoothly around the central celebration.',
  },
];

export const CAMERA_MOTIONS = [
  {
    id: 'orbit_360',
    label: '360° Orbit',
    icon: '🔄',
    desc: 'Fluid eye-level wrap around',
    directive: 'Dynamic 360-degree orbital tracking sweep circling smoothly around the subject.',
  },
  {
    id: 'crane_rise',
    label: 'Crane Rise & Tilt',
    icon: '⬆️',
    desc: 'Grand ascending floor-to-ceiling tilt',
    directive: 'Elevated crane arc rising gracefully upward, tilting down to reveal the full ceremonial spectacle.',
  },
  {
    id: 'tracking_slider',
    label: 'Lateral Dolly',
    icon: '➡️',
    desc: 'Low-angle sideways slider glide',
    directive: 'Low-angle smooth lateral slider dolly moving sideways with shallow depth of field.',
  },
  {
    id: 'push_in',
    label: 'Smooth Push-In',
    icon: '🎯',
    desc: 'Intimate slow forward push',
    directive: 'Slow dramatic push-in settling gently on the emotional focal point with delicate rack focus.',
  },
  {
    id: 'drone_aerial',
    label: 'Drone Aerial',
    icon: '🚁',
    desc: 'Sweeping palace sky view',
    directive: 'Sweeping aerial drone tracking shot gliding over water fountains and intricately carved sandstone jharokhas.',
  },
  {
    id: 'steadicam_walk',
    label: 'Steadicam Walk',
    icon: '🚶',
    desc: 'Immersive guest POV walkthrough',
    directive: 'Immersive steadicam moving smoothly forward through joyful guests and floating floral canopies.',
  },
  {
    id: 'static_tripod',
    label: 'Locked Master',
    icon: '🛑',
    desc: 'High-fidelity static frame',
    directive: 'Locked tripod cinematic frame with exquisite physical motion of falling petals and rising incense smoke.',
  },
];

export const LIGHTING_CONFIGS = [
  {
    id: 'golden_hour',
    label: 'Golden Hour Dawn',
    icon: '🌅',
    colorFrom: '#F59E0B',
    colorTo: '#EA580C',
    directive: 'Warm amber dawn 3200K sunbeams filtering through mist, golden volumetric light and soft haze.',
  },
  {
    id: 'sacred_firelight',
    label: 'Sacred Agni Firelight',
    icon: '🪔',
    colorFrom: '#EA580C',
    colorTo: '#DC2626',
    directive: 'Dancing 2200K sacred firelight from the Agni Kund, flickering brass diyas and warm crimson shadows.',
  },
  {
    id: 'tungsten_chandeliers',
    label: 'Tungsten Chandeliers',
    icon: '💡',
    colorFrom: '#FEF08A',
    colorTo: '#D97706',
    directive: 'Opulent crystal chandelier glow, warm tungsten interior illumination and sparkling reflections.',
  },
  {
    id: 'high_key_daylight',
    label: 'Sunlit Noon Garden',
    icon: '☀️',
    colorFrom: '#FDE047',
    colorTo: '#CA8A04',
    directive: 'Brilliant high-key 5600K daylight, rich yellow and marigold orange saturation under clear blue skies.',
  },
  {
    id: 'starlit_night',
    label: 'Starlit Sky & Sparklers',
    icon: '🌌',
    colorFrom: '#1E1B4B',
    colorTo: '#4338CA',
    directive: 'Midnight indigo sky, soft ambient fairy lights, and golden cold sparklers casting warm bokeh.',
  },
  {
    id: 'sangeet_party',
    label: 'Sangeet Stage Lighting',
    icon: '🪩',
    colorFrom: '#9333EA',
    colorTo: '#DB2777',
    directive: 'Concert stage moving head spotlights in gold and magenta, rhythmic stage haze and dynamic beams.',
  },
];

export const LENS_CONFIGS = [
  { id: '24mm_wide', label: '24mm Ultra-Wide', desc: 'Epic architectural scale' },
  { id: '35mm_anamorphic', label: '35mm Anamorphic', desc: 'Cinematic 2.39:1 widescreen & oval bokeh' },
  { id: '50mm_prime', label: '50mm Prime f/1.2', desc: 'Creamy portrait bokeh & natural perspective' },
  { id: '85mm_portrait', label: '85mm Tele-Portrait', desc: 'Facial compression & ultra-shallow focus' },
  { id: '100mm_macro', label: '100mm Macro Probe', desc: '1:1 extreme jewelry & henna magnification' },
];

export const PACING_CONFIGS = [
  { id: 'slow_120fps', label: '120fps Ultra Slow', badge: 'Ultra Slow-Mo', desc: 'Suspended petals and ethereal fabric flow' },
  { id: 'cinematic_60fps', label: '60fps Cinematic', badge: 'Slow-Motion', desc: 'Emotional glances and joyous smiles' },
  { id: 'film_24fps', label: '24fps Film Speed', badge: 'Standard Film', desc: 'Authentic cinematic cadence and natural motion blur' },
  { id: 'speed_ramped', label: 'Speed-Ramped', badge: 'Dynamic', desc: 'Rhythmic cuts accelerating with dhol and music beats' },
];

export const ATMOSPHERE_FX = [
  { id: 'petals_rose', label: 'Rose Petals', icon: '🌹', prompt: 'cascading shower of deep red rose petals drifting in air' },
  { id: 'petals_marigold', label: 'Marigold Shower', icon: '🌼', prompt: 'vibrant yellow and orange marigold flower shower' },
  { id: 'sparklers_gold', label: 'Gold Sparklers', icon: '✨', prompt: 'crackling cold golden fireworks sparklers catching in background' },
  { id: 'diyas_water', label: 'Floating Diyas', icon: '🪔', prompt: 'glowing brass diyas and floating candles reflecting on water' },
  { id: 'incense_smoke', label: 'Sandalwood Smoke', icon: '💨', prompt: 'delicate wisps of fragrant sandalwood incense and sacred havan smoke' },
  { id: 'zari_shimmer', label: 'Zari Shimmer', icon: '🧵', prompt: 'gleaming gold and silver zari embroidery reflecting ambient light' },
  { id: 'night_fireworks', label: 'Night Fireworks', icon: '🎆', prompt: 'golden celebratory aerial fireworks bursting softly in distant sky' },
  { id: 'jasmine_garlands', label: 'Jasmine Garlands', icon: '🌿', prompt: 'fresh white mogra jasmine floral garlands gently swaying' },
];

export const AUDIO_MOODS = [
  {
    id: 'shehnai_santoor',
    label: 'Shehnai & Santoor Alaap',
    icon: '🪈',
    cue: 'Soulful morning Alaap with Shehnai and Santoor, building into a subtle acoustic heartbeat rhythm.',
  },
  {
    id: 'dhol_nagada',
    label: 'Festive Dhol & Nagada',
    icon: '🥁',
    cue: 'Upbeat Punjabi & Rajasthani Dhol rhythms, cheerful claps, and energetic nagada rolls.',
  },
  {
    id: 'vedic_mantras',
    label: 'Vedic Sanskrit Chants',
    icon: '🕉️',
    cue: 'Resonant sacred Vedic mantras chanted in Sanskrit with soul-stirring temple bells and conch shell flourish.',
  },
  {
    id: 'royal_symphony',
    label: 'Royal Orchestral Strings',
    icon: '🎻',
    cue: 'Grand Western orchestral symphony blending sweeping cellos and violins with an emotive Sitar solo.',
  },
  {
    id: 'sitar_tabla',
    label: 'Sitar & Tabla Jugalbandi',
    icon: '🪕',
    cue: 'Intricate classical acoustic Jugalbandi between Sitar and Tabla with rapid melodic flourishes.',
  },
  {
    id: 'bollywood_acoustic',
    label: 'Romantic Bollywood Acoustic',
    icon: '🎹',
    cue: 'Warm acoustic guitar strumming, emotive grand piano chords, and tender romantic string swells.',
  },
];

export const COLOR_TONES = [
  {
    id: 'royal_crimson',
    label: 'Royal Crimson & Gold',
    primary: '#7B1113',
    secondary: '#D97706',
    desc: 'Rich velvet crimson shadows, metallic gold leaf accents, and high-dynamic-range film stock.',
  },
  {
    id: 'turmeric_gold',
    label: 'Turmeric Yellow & Saffron',
    primary: '#EAB308',
    secondary: '#EA580C',
    desc: 'Luminous sunshine yellow, vibrant marigold orange saturation, and warm golden highlights.',
  },
  {
    id: 'emerald_henna',
    label: 'Emerald Green & Blush Pink',
    primary: '#047857',
    secondary: '#F472B6',
    desc: 'Deep henna emerald foliage, soft blush pink florals, and fresh festive garden ambiance.',
  },
  {
    id: 'midnight_sapphire',
    label: 'Midnight Sapphire & Champagne',
    primary: '#1E3A8A',
    secondary: '#F59E0B',
    desc: 'Deep indigo midnight sky, sparkling tungsten chandeliers, and champagne silk highlights.',
  },
  {
    id: 'champagne_ivory',
    label: 'Champagne & Ivory Slate',
    primary: '#475569',
    secondary: '#D97706',
    desc: 'Understated royal luxury, pure ivory silk drapery, and warm candlelit champagne glow.',
  },
];

// Helper to synthesize engine-specific prompts for an individual scene
export const synthesizeScenePrompts = (
  scene: {
    visualAction: string;
    cameraMovement: string;
    lightingAndAtmosphere: string;
    colorGrading: string;
    shotType?: string;
  },
  accentString = ''
): Record<TargetVideoModel, string> => {
  const { visualAction, cameraMovement, lightingAndAtmosphere, colorGrading, shotType } = scene;
  const shotSnippet = shotType
    ? SHOT_TYPES.find((s) => s.id === shotType)?.promptSnippet || ''
    : '';
  const accents = accentString ? ` Atmospheric details: ${accentString}.` : '';

  return {
    sora: `Cinematic 4k 24fps. ${shotSnippet ? shotSnippet + ' ' : ''}${visualAction}${accents} Camera: ${cameraMovement}. Lighting: ${lightingAndAtmosphere}. Color grading: ${colorGrading}. Photorealistic Indian wedding cinema, authentic fabric textures, volumetric lighting, 35mm film rendering.`,
    runway_gen3: `[Camera Move: ${cameraMovement}] [Subject: ${visualAction}${accents}] [Lighting: ${lightingAndAtmosphere}] [Color & Style: ${colorGrading}, Photorealistic Indian wedding cinema, 8k, 24fps]`,
    luma_dream: `Ultra realistic cinematic footage of Indian wedding celebration: ${visualAction}.${accents} Camera movement: ${cameraMovement}. Atmosphere: ${lightingAndAtmosphere}. Emotionally evocative, smooth physical dynamics, authentic regal colors.`,
    google_veo: `High resolution realistic capture of Indian wedding ceremony: ${visualAction}.${accents} Authentic cultural rituals and costumes, rich zari and textile physics, camera: ${cameraMovement}. Professional cinematic lighting: ${lightingAndAtmosphere}.`,
    pika: `Cinematic Indian wedding: ${visualAction}${accents} -camera ${cameraMovement.toLowerCase().includes('zoom') ? 'zoom in' : 'pan'} -fps 24 -motion 4`,
  };
};

// Assemble full meta-prompt for manual execution in chat or export
export const assembleMetaPrompt = (
  wedding: Wedding,
  invite: EInvite,
  targetModel: TargetVideoModel,
  scenes: VideoSceneStoryboard[],
  options: VideoPromptOptions
): string => {
  const couple = `${wedding.brideName} & ${wedding.groomName}`;
  const primaryColor = invite.themeColors?.primary || '#7B1113';
  const secondaryColor = invite.themeColors?.secondary || '#D97706';
  const styleLabel = VISUAL_STYLES.find((s) => s.id === options.visualStyle)?.label || 'Heritage Royal';

  return `# Multi-Pass AI Video Generation Script for ${couple}'s Indian Wedding

## Project & E-Invite Context
- **Couple**: ${couple}
- **Destination**: ${wedding.venue}, ${wedding.city}
- **Celebration Dates**: ${wedding.startDate} to ${wedding.endDate}
- **Host Families**: ${invite.hostFamilyNames || 'The Wedding Families'}
- **Cover Greeting**: "${invite.coverGreeting || '|| Shree Ganeshay Namah ||'}"
- **Personal Inviting Message**: "${invite.customMessage || ''}"
- **Theme Palette**: Primary: ${primaryColor} | Secondary: ${secondaryColor} | Background: ${invite.themeColors?.background || '#FCFBF7'}
- **Background Motif**: ${invite.backgroundTheme || 'royal_mandala'} | Icon: ${invite.iconOption || 'traditional'}
- **RSVP Details**: ${invite.rsvpPhone || wedding.venue}
- **Visual Style Preset**: ${styleLabel}
- **Target Video Engine**: ${targetModel.toUpperCase()}

---

## Pass 1: Narrative Storyboard Arc
${scenes.map((s) => `### Scene ${s.sceneNumber}: ${s.title} (${s.durationSeconds}s)
- **Visual Action**: ${s.visualAction}
- **Camera Movement**: ${s.cameraMovement}
- **Lighting & Mood**: ${s.lightingAndAtmosphere}
- **Color Grading**: ${s.colorGrading}`).join('\n\n')}

---

## Pass 2: Engine-Specific Video Prompts (${targetModel.toUpperCase()})
${scenes.map((s) => `### Scene ${s.sceneNumber} (${s.title}) Prompt:
\`\`\`
${s.modelPrompts[targetModel]}
\`\`\``).join('\n\n')}

---

## Pass 3: Multilingual Voiceover & Audio Arrangement
${scenes.map((s) => `### Scene ${s.sceneNumber} Audio:
- **Musical Cue**: ${s.audioCue}
- **Voiceover (English)**: "${s.voiceoverNarration.english}"
- **Voiceover (Hindi)**: "${s.voiceoverNarration.hindi}"
- **Voiceover (Hinglish)**: "${s.voiceoverNarration.hinglish}"`).join('\n\n')}
`;
};

// Helper to assemble algorithmic prompt pack without calling external API
export const generateAlgorithmicPromptPack = (
  invite: EInvite,
  wedding: Wedding,
  events: WeddingEvent[],
  targetModel: TargetVideoModel = 'sora',
  options: VideoPromptOptions = {}
): MultiPassVideoPromptPack => {
  const couple = `${wedding.brideName} & ${wedding.groomName}`;
  const primaryColor = invite.themeColors?.primary || '#7B1113';
  const secondaryColor = invite.themeColors?.secondary || '#D97706';
  const venue = `${wedding.venue}, ${wedding.city}`;

  const visualStyle = options.visualStyle || 'royal_heritage';
  const lensPreset = options.lensPreset || '35mm_anamorphic';
  const lightingPreset = options.lightingPreset || 'golden_hour';
  const pacingPreset = options.pacingPreset || 'slow_motion';
  const accents = options.culturalAccents || ['petals', 'sparklers', 'diyas'];

  const selectedLens = LENS_PRESETS.find((l) => l.id === lensPreset)?.label || '35mm Anamorphic Lens';
  const selectedLighting = LIGHTING_PRESETS.find((l) => l.id === lightingPreset)?.label || 'Golden Hour Sunrise/Dusk';
  const selectedPacing = PACING_PRESETS.find((p) => p.id === pacingPreset)?.label || 'Dreamy Slow-Motion';

  const accentStrings = accents
    .map((id) => CULTURAL_ACCENTS_LIST.find((a) => a.id === id)?.promptText)
    .filter(Boolean)
    .join(', ');

  const includedEvents = events.filter((e) => invite.includedEventIds.includes(e.id));
  const activeEvents = includedEvents.length > 0 ? includedEvents : events.slice(0, 4);

  // Background motif context description
  const motifDesc = invite.backgroundTheme && invite.backgroundTheme !== 'none'
    ? `subtle architectural motifs of ${invite.backgroundTheme.replace(/_/g, ' ')} etched in sandstone`
    : 'intricate carved royal sandstone jali arches';

  // Icon context description
  const iconDesc = invite.iconOption && invite.iconOption !== 'none'
    ? `a sacred shimmering golden emblem of ${invite.iconOption.replace(/_/g, ' ')}`
    : 'a majestic golden royal wedding monogram';

  // Generate canonical scenes
  const scenes: VideoSceneStoryboard[] = [
    {
      sceneNumber: 1,
      title: 'The Royal Awakening & Sacred Monogram',
      durationSeconds: 5,
      shotType: 'wide_establishing',
      cameraMotionId: 'push_in',
      lightingId: 'golden_hour',
      lensId: '35mm_anamorphic',
      pacingId: 'slow_120fps',
      activeFX: ['petals_rose', 'incense_smoke', 'sparklers_gold'],
      audioMoodId: 'shehnai_santoor',
      colorToneId: 'royal_crimson',
      visualAction: `A magnificent palace courtyard in ${wedding.city} at golden dawn. Soft morning mist settles over carved marble arches with ${motifDesc}. Rising gently in the center is ${iconDesc} with initials of ${couple}, illuminated by warm sunbeams. Floating ${accentStrings || 'marigold and rose petals'}.`,
      cameraMovement: `Extreme slow smooth dolly-in using ${selectedLens}, shallow depth of field.`,
      lightingAndAtmosphere: `${selectedLighting}. Warm amber dawn rays catching morning dew and incense mist, keyed to ${primaryColor} and ${secondaryColor}.`,
      colorGrading: `Regal warm gold, deep crimson shadows, cinematic film stock with ${selectedPacing.toLowerCase()} cadence.`,
      voiceoverNarration: {
        english: `${invite.coverGreeting || 'Under auspicious skies'}, two families unite in love and tradition. Welcome to the grand wedding celebrations of ${couple}.`,
        hindi: `बड़ों का आशीर्वाद, खुशियों का पावन संगम — ${invite.coverGreeting || 'श्री गणेशाय नमः'}। ${couple} के शुभ विवाह में आपका सप्रेम स्वागत है।`,
        hinglish: `${invite.coverGreeting || 'With blessings of our elders'}, we warmly welcome you to celebrate the joyous union of ${couple}.`,
      },
      audioCue: AUDIO_MOODS.find((m) => m.id === 'shehnai_santoor')?.cue || 'Gentle morning Alaap with flute and santoor.',
      modelPrompts: synthesizeScenePrompts(
        {
          shotType: 'wide_establishing',
          visualAction: `A magnificent palace courtyard in ${wedding.city} at golden dawn. Soft morning mist over carved marble arches with ${motifDesc}. Rising in the center is ${iconDesc} with initials of ${couple}.`,
          cameraMovement: `Extreme slow smooth dolly-in using ${selectedLens}.`,
          lightingAndAtmosphere: `${selectedLighting}, keyed to ${primaryColor} and ${secondaryColor}.`,
          colorGrading: `Regal warm gold, deep crimson shadows, ${selectedPacing.toLowerCase()}.`,
        },
        accentStrings
      ),
    },
    ...activeEvents.map((evt, idx) => {
      const sceneNo = idx + 2;
      const isHaldi = evt.type === 'haldi';
      const isMehendi = evt.type === 'mehendi';
      const isSangeet = evt.type === 'sangeet' || evt.type === 'cocktail';
      const isWedding = evt.type === 'wedding';

      let shotType = 'medium_couple';
      let cameraMotionId = 'tracking_slider';
      let lightingId = 'golden_hour';
      let audioMoodId = 'royal_symphony';
      let colorToneId = 'royal_crimson';
      let activeFX: string[] = ['petals_marigold', 'sparklers_gold'];

      let visualAction = '';
      let cameraMove = '';
      let lighting = '';
      let voEnglish = '';
      let voHindi = '';
      let voHinglish = '';
      let audioCue = '';

      if (isHaldi) {
        shotType = 'medium_couple';
        cameraMotionId = 'tracking_slider';
        lightingId = 'high_key_daylight';
        audioMoodId = 'dhol_nagada';
        colorToneId = 'turmeric_gold';
        activeFX = ['petals_marigold'];

        visualAction = `Celebratory Haldi ritual at ${evt.venue || venue}. Sunshine yellow marigold flower shower erupting in slow motion around joyous smiling family members, turmeric powder mist catching ambient daylight.`;
        cameraMove = `Low-angle slow tracking shot using ${selectedLens} at ${selectedPacing.toLowerCase()}.`;
        lighting = 'Brilliant midday sunshine, vibrant yellow and marigold orange saturation, high-key cheerful glow.';
        voEnglish = `Bright mornings filled with laughter, holy turmeric, and marigold blessings at the ${evt.name}.`;
        voHindi = `हल्दी की महक, अपनों की हंसी और खुशियों की फुहार — ${evt.name}।`;
        voHinglish = `Join us for golden smiles and vibrant blessings at the ${evt.name}.`;
        audioCue = AUDIO_MOODS.find((m) => m.id === 'dhol_nagada')?.cue || 'Upbeat folk dholak beats, shehnai trills.';
      } else if (isMehendi) {
        shotType = 'macro_detail';
        cameraMotionId = 'push_in';
        lightingId = 'golden_hour';
        audioMoodId = 'sitar_tabla';
        colorToneId = 'emerald_henna';
        activeFX = ['jasmine_garlands', 'petals_rose'];

        visualAction = `Intricate henna artist drawing delicate paisley and lotus motifs on the bride's palms, surrounded by silk cushions, colorful lehariya canopies, and laughing cousins at ${evt.venue || venue}.`;
        cameraMove = `Macro close-up gliding over henna details, pulling back into a medium festive reveal with ${selectedLens}.`;
        lighting = 'Soft emerald and blush pink filtered sunlight, festive garden ambiance.';
        voEnglish = `Intricate strokes of love and timeless folk traditions at ${evt.name}.`;
        voHindi = `हाथों में रची मेहंदी, सपनों का नया संसार — ${evt.name}।`;
        voHinglish = `Henna swirls, vibrant music, and festive cheer at ${evt.name}.`;
        audioCue = AUDIO_MOODS.find((m) => m.id === 'sitar_tabla')?.cue || 'Traditional folk melodies with acoustic strings.';
      } else if (isSangeet) {
        shotType = 'orbital_360';
        cameraMotionId = 'orbit_360';
        lightingId = 'sangeet_party';
        audioMoodId = 'dhol_nagada';
        colorToneId = 'midnight_sapphire';
        activeFX = ['sparklers_gold', 'night_fireworks'];

        visualAction = `Glamorous high-energy Sangeet stage at ${evt.venue || venue}, illuminated by sparkling crystal chandeliers, dynamic warm gold spotlight sweeps, couple and wedding party dancing in sequined couture.`;
        cameraMove = `Dynamic orbital 360-degree sweep around the dance stage using ${selectedLens}, speed-ramped from slow motion to fast tempo.`;
        lighting = 'Rich midnight indigo, warm tungsten chandeliers, golden stage fireworks and haze.';
        voEnglish = `A dazzling night of rhythm, celebration, and unforgettable performances at ${evt.name}.`;
        voHindi = `सुर, ताल और थिरकते कदमों की एक शाम — ${evt.name}।`;
        voHinglish = `Get ready to dance the night away at ${evt.name}!`;
        audioCue = AUDIO_MOODS.find((m) => m.id === 'dhol_nagada')?.cue || 'Energetic Bollywood & Punjabi Dhol rhythms.';
      } else if (isWedding) {
        shotType = 'medium_couple';
        cameraMotionId = 'crane_rise';
        lightingId = 'sacred_firelight';
        audioMoodId = 'vedic_mantras';
        colorToneId = 'royal_crimson';
        activeFX = ['petals_rose', 'incense_smoke', 'diyas_water'];

        visualAction = `The sacred Mandap under starlit skies at ${evt.venue || venue}. Glowing sacred Agni Kund fire, fragrant sandalwood smoke, couple in royal crimson and ivory sherwani taking the sacred Saat Pheras, golden flower rain cascading down.`;
        cameraMove = `Slow elevated crane arc circling the sacred Mandap with ${selectedLens}, rack focus from the sacred fire to the couple holding hands.`;
        lighting = 'Warm sacred firelight, deep crimson ambiance, twinkling starlight and candle glow.';
        voEnglish = `Seven vows, eternal promises, and sacred pheras around the agni kund at the ${evt.name}.`;
        voHindi = `सात फेरे, सात वचन, सात जन्मों का पावन संगम — ${evt.name}।`;
        voHinglish = `Witness the eternal union and sacred pheras of ${couple} at the ${evt.name}.`;
        audioCue = AUDIO_MOODS.find((m) => m.id === 'vedic_mantras')?.cue || 'Resonant Vedic mantras chanted in Sanskrit.';
      } else {
        shotType = 'wide_establishing';
        cameraMotionId = 'crane_rise';
        lightingId = 'tungsten_chandeliers';
        audioMoodId = 'royal_symphony';
        colorToneId = 'champagne_ivory';
        activeFX = ['sparklers_gold', 'jasmine_garlands'];

        visualAction = `Grand banquet hall at ${evt.venue || venue}, decorated with cascading ivory orchids and gold lanterns. Guests raising toasts in honor of the newlyweds ${couple}, elegant chandeliers sparkling.`;
        cameraMove = `Sweeping crane tracking shot over the banquet hall with ${selectedLens}, concluding on the royal couple stage.`;
        lighting = 'Luxurious warm champagne glow, soft ambient candlelight.';
        voEnglish = `An evening of royal grandeur, dining, and toasts to the newlyweds at ${evt.name}.`;
        voHindi = `नवदंपति के स्वागत में एक भव्य और अविस्मरणीय शाम — ${evt.name}।`;
        voHinglish = `Celebrate and raise a toast to ${couple} at the ${evt.name}.`;
        audioCue = AUDIO_MOODS.find((m) => m.id === 'royal_symphony')?.cue || 'Grand orchestral symphony blending sitar and strings.';
      }

      return {
        sceneNumber: sceneNo,
        title: evt.name,
        durationSeconds: 5,
        ceremonyType: evt.type,
        shotType,
        cameraMotionId,
        lightingId,
        lensId: '35mm_anamorphic',
        pacingId: 'slow_120fps',
        activeFX,
        audioMoodId,
        colorToneId,
        visualAction,
        cameraMovement: cameraMove,
        lightingAndAtmosphere: lighting,
        colorGrading: `Cinematic tones emphasizing ${evt.type === 'haldi' ? '#EAB308' : primaryColor}, ${selectedPacing.toLowerCase()}.`,
        voiceoverNarration: {
          english: voEnglish,
          hindi: voHindi,
          hinglish: voHinglish,
        },
        audioCue,
        modelPrompts: synthesizeScenePrompts(
          {
            shotType,
            visualAction,
            cameraMovement: cameraMove,
            lightingAndAtmosphere: lighting,
            colorGrading: `Cinematic tones emphasizing ${evt.type === 'haldi' ? '#EAB308' : primaryColor}, ${selectedPacing.toLowerCase()}.`,
          },
          accentStrings
        ),
      };
    }),
    {
      sceneNumber: activeEvents.length + 2,
      title: 'Grand Finale & Royal RSVP Card',
      durationSeconds: 5,
      shotType: 'close_up',
      cameraMotionId: 'push_in',
      lightingId: 'starlit_night',
      lensId: '35mm_anamorphic',
      pacingId: 'cinematic_60fps',
      activeFX: ['sparklers_gold', 'diyas_water'],
      audioMoodId: 'royal_symphony',
      colorToneId: 'royal_crimson',
      visualAction: `Camera settles on an elegant antique velvet card holder opening to reveal the official digital wedding invitation for ${couple} with host family "${invite.hostFamilyNames || 'The Wedding Families'}" and RSVP details: "${invite.rsvpPhone || wedding.venue}". Floating golden sparklers and silk ribbon framing. Personal blessing: "${invite.customMessage ? invite.customMessage.slice(0, 100) + '...' : 'Please grace our auspicious occasion with your presence.'}"`,
      cameraMovement: `Smooth push-in using ${selectedLens} settling on the invitation typography and QR code / RSVP link.`,
      lightingAndAtmosphere: 'Romantic candlelit terrace, starlit night sky, warm celebratory sparkle.',
      colorGrading: 'Rich velvet crimson, embossed metallic gold typography.',
      voiceoverNarration: {
        english: `We eagerly await your gracious presence and blessings to make our celebrations truly complete. RSVP today.`,
        hindi: `आपकी गरिमामयी उपस्थिति और आशीर्वाद हमारे उत्सव को पूर्ण बनाएगा। सादर आमंत्रित हैं।`,
        hinglish: `Your presence and blessings will make our special day complete. Kindly RSVP and join us in celebrating!`,
      },
      audioCue: AUDIO_MOODS.find((m) => m.id === 'royal_symphony')?.cue || 'Grand concluding musical flourish.',
      modelPrompts: synthesizeScenePrompts(
        {
          shotType: 'close_up',
          visualAction: `Camera settles on an elegant antique velvet card holder opening to reveal the official digital wedding invitation for ${couple} with host family "${invite.hostFamilyNames || 'The Families'}" and RSVP contact: "${invite.rsvpPhone || wedding.venue}".`,
          cameraMovement: `Smooth macro push-in using ${selectedLens} settling on embossed gold lettering.`,
          lightingAndAtmosphere: 'Romantic candlelit terrace, starlit night sky, warm celebratory sparkle.',
          colorGrading: 'Rich velvet crimson, embossed metallic gold typography.',
        },
        accentStrings
      ),
    },
  ];

  // Pass 1 summary
  const pass1 = `Narrative breakdown for ${couple}'s Vivah: ${scenes.length} chronological cinematic beats progressing from dawn arrival at ${wedding.venue}, through sacred ceremonies (${activeEvents.map((e) => e.name).join(', ')}), culminating in a royal invitation card closing call-to-action with host families (${invite.hostFamilyNames || 'The Families'}).`;

  // Pass 2 summary
  const pass2 = `Visual aesthetic tailored for ${TARGET_VIDEO_MODELS.find((m) => m.id === targetModel)?.name || 'AI Video'}. Incorporating ${selectedLens}, ${selectedLighting}, and color palettes keyed to ${primaryColor} (primary) and ${secondaryColor} (accent) with authentic Indian textile physics (zari silk, flowing dupattas, marigold showers) and ${selectedPacing.toLowerCase()} cadence.`;

  // Pass 3 summary
  const pass3 = `Audio landscape combining traditional North & South Indian acoustic instruments (Shehnai, Santoor, Tabla, Dholak) synchronized with 3-language voiceover scripts (English, Hindi, Hinglish) and transition markers.`;

  // Assemble full meta-prompt
  const metaPrompt = assembleMetaPrompt(wedding, invite, targetModel, scenes, options);

  return {
    weddingTitle: wedding.title,
    coupleNames: couple,
    targetModel,
    options,
    pass1_narrativeSummary: pass1,
    pass2_cameraAestheticDirective: pass2,
    pass3_soundAndVoiceoverMaster: pass3,
    scenes,
    metaPromptForManualAI: metaPrompt,
  };
};

// Execute live AI completion via user's API key
export const executeMultiPassAIPipeline = async (
  invite: EInvite,
  wedding: Wedding,
  events: WeddingEvent[],
  targetModel: TargetVideoModel,
  settings: WeddingAISettings,
  options: VideoPromptOptions = {},
  customInstructions?: string
): Promise<MultiPassVideoPromptPack> => {
  // First build baseline structure
  const basePack = generateAlgorithmicPromptPack(invite, wedding, events, targetModel, options);

  const systemPrompt = `You are a world-class Indian Wedding Cinematic Director and AI Video Prompt Engineer specializing in OpenAI Sora, Runway Gen-3 Alpha, Luma Dream Machine, Google Veo, and Pika Labs.
You craft authentic, visually breathtaking prompts that honor Indian wedding rituals, royal palace aesthetics, traditional textiles (zari, silk, brocade), emotional family moments, and dynamic camera movements.`;

  const userPrompt = `Generate a refined, production-grade 3-Pass AI Video prompt pack for ${wedding.brideName} & ${wedding.groomName}'s wedding invitation video.

Wedding Details:
- Title: ${wedding.title}
- Couple: ${wedding.brideName} & ${wedding.groomName}
- Destination: ${wedding.venue}, ${wedding.city}
- Host Families: ${invite.hostFamilyNames || 'The Families'}
- Greeting: "${invite.coverGreeting || ''}"
- Personal Inviting Message: "${invite.customMessage || ''}"
- Background Motif: ${invite.backgroundTheme || 'royal_mandala'} | Icon: ${invite.iconOption || 'traditional'}
- Ceremonies: ${events.map((e) => `${e.name} (${e.type}, ${e.venue || wedding.venue})`).join('; ')}
- Primary Theme Color: ${invite.themeColors?.primary || '#7B1113'}
- Accent Theme Color: ${invite.themeColors?.secondary || '#D97706'}
- Target Video Model: ${targetModel.toUpperCase()}
- Director Visual Style: ${options.visualStyle || 'Heritage Royal'}
- Lens: ${options.lensPreset || '35mm Anamorphic'}
- Lighting: ${options.lightingPreset || 'Golden Hour'}
- Pacing: ${options.pacingPreset || 'Slow Motion'}
- Cultural Accents: ${(options.culturalAccents || []).join(', ')}
${customInstructions ? `- Custom User Notes: ${customInstructions}` : ''}

Output a comprehensive, beautifully structured response with:
1. Pass 1: Narrative Storyboard Structure (Scene-by-scene progression)
2. Pass 2: Exact, ready-to-paste video prompts formatted specifically for ${targetModel.toUpperCase()}
3. Pass 3: Multilingual voiceover script (English, Hindi, Hinglish) and sound design cues for each scene.`;

  try {
    const aiOutput = await callAICompletion(userPrompt, systemPrompt, settings);
    return {
      ...basePack,
      pass1_narrativeSummary: `AI Generated via ${settings.preferredProvider?.toUpperCase() || 'AI'}:\n\n` + aiOutput.slice(0, 500) + '...',
      metaPromptForManualAI: aiOutput,
    };
  } catch (err: any) {
    console.warn('AI API call failed, falling back to algorithmic pack:', err);
    throw err;
  }
};
