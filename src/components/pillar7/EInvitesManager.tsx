import React, { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, EInvite, WeddingEvent } from '../../db/schema';
import { toPng } from 'html-to-image';
import {
  Mail,
  Plus,
  Edit2,
  Trash2,
  Share2,
  Sparkles,
  MapPin,
  Calendar,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  Copy,
  Layout,
  Crown,
  Flower2,
  Compass,
  Palette,
  Eye,
  Sliders,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Heart,
  Music,
  Wine,
  Sun,
  Gem,
  Star,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';

interface EInvitesManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

// Cultural Pre-defined Color Palettes
export const COLOR_PALETTES = [
  {
    id: 'rajputana_crimson',
    name: 'Royal Rajputana',
    primary: '#7B1113',
    secondary: '#D97706',
    background: '#FFFDF9',
    cardBg: '#FFFDF9',
    text: '#271E1D',
    borderColor: '#D97706',
  },
  {
    id: 'mughal_emerald',
    name: 'Mughal Emerald',
    primary: '#0F766E',
    secondary: '#CA8A04',
    background: '#F0FDF4',
    cardBg: '#F8FCF9',
    text: '#134E4A',
    borderColor: '#CA8A04',
  },
  {
    id: 'saffron_marigold',
    name: 'Saffron Sunset',
    primary: '#C2410C',
    secondary: '#EA580C',
    background: '#FFFBEB',
    cardBg: '#FFFEF8',
    text: '#431407',
    borderColor: '#EA580C',
  },
  {
    id: 'pastel_romance',
    name: 'Blush & Gold',
    primary: '#BE185D',
    secondary: '#D97706',
    background: '#FDF2F8',
    cardBg: '#FFF9FB',
    text: '#831843',
    borderColor: '#F472B6',
  },
  {
    id: 'midnight_sapphire',
    name: 'Midnight Sapphire',
    primary: '#1E3A8A',
    secondary: '#D97706',
    background: '#F8FAFC',
    cardBg: '#FFFFFF',
    text: '#0F172A',
    borderColor: '#3B82F6',
  },
  {
    id: 'contemporary_slate',
    name: 'Contemporary Ivory',
    primary: '#334155',
    secondary: '#6366F1',
    background: '#F8FAFC',
    cardBg: '#FFFFFF',
    text: '#0F172A',
    borderColor: '#94A3B8',
  },
];

// Helper to parse hex or existing rgba string and apply alpha multiplier
export const parseColorToRgba = (colorStr: string, alphaMultiplier = 1): string => {
  if (!colorStr) return `rgba(217, 119, 6, ${(0.2 * alphaMultiplier).toFixed(2)})`;
  if (colorStr.startsWith('rgba(')) {
    const match = colorStr.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
    if (match) {
      const [_, r, g, b, a] = match;
      const computedAlpha = Math.min(1, Math.max(0, parseFloat(a) * alphaMultiplier));
      return `rgba(${r}, ${g}, ${b}, ${computedAlpha.toFixed(2)})`;
    }
    return colorStr;
  }
  if (colorStr.startsWith('rgb(')) {
    const match = colorStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${(0.25 * alphaMultiplier).toFixed(2)})`;
    }
  }
  let hex = colorStr.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${(0.25 * alphaMultiplier).toFixed(2)})`;
  }
  return colorStr;
};

export const hexAndOpacityToRgba = (hexColor: string, opacity: number): string => {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`;
  }
  return hexColor;
};

// 14 Curated Indian Wedding Background Patterns with RGBA Watermark support
export const BACKGROUND_PATTERNS: {
  id: NonNullable<EInvite['backgroundTheme']>;
  name: string;
  css: (color: string) => string;
  backgroundSize?: string;
}[] = [
  {
    id: 'damask',
    name: 'Ornate Damask Arches',
    css: (color) =>
      `radial-gradient(circle at 50% 50%, ${parseColorToRgba(color, 1.2)} 16%, transparent 17%), radial-gradient(circle at 0% 0%, ${parseColorToRgba(color, 0.9)} 16%, transparent 17%), radial-gradient(circle at 100% 100%, ${parseColorToRgba(color, 0.9)} 16%, transparent 17%)`,
    backgroundSize: '40px 40px',
  },
  {
    id: 'mandala',
    name: 'Sacred Mandala Watermark',
    css: (color) =>
      `radial-gradient(circle at 50% 35%, ${parseColorToRgba(color, 1.4)} 0%, ${parseColorToRgba(color, 1.0)} 24%, ${parseColorToRgba(color, 0.4)} 50%, transparent 75%)`,
    backgroundSize: '100% 100%',
  },
  {
    id: 'floral',
    name: 'Mughal Trellis Vine',
    css: (color) =>
      `repeating-linear-gradient(45deg, ${parseColorToRgba(color, 1.0)} 0px, ${parseColorToRgba(color, 1.0)} 2px, transparent 2px, transparent 20px), repeating-linear-gradient(-45deg, ${parseColorToRgba(color, 1.0)} 0px, ${parseColorToRgba(color, 1.0)} 2px, transparent 2px, transparent 20px)`,
    backgroundSize: '32px 32px',
  },
  {
    id: 'imperial_gradient',
    name: 'Imperial Radial Aura',
    css: (color) =>
      `radial-gradient(circle at top right, ${parseColorToRgba(color, 1.5)}, transparent 65%), radial-gradient(circle at bottom left, ${parseColorToRgba(color, 1.2)}, transparent 65%)`,
    backgroundSize: '100% 100%',
  },
  {
    id: 'clean_linen',
    name: 'Clean Linen Minimal',
    css: (color) =>
      `repeating-linear-gradient(0deg, ${parseColorToRgba(color, 0.8)}, ${parseColorToRgba(color, 0.8)} 1px, transparent 1px, transparent 12px), repeating-linear-gradient(90deg, ${parseColorToRgba(color, 0.8)}, ${parseColorToRgba(color, 0.8)} 1px, transparent 1px, transparent 12px)`,
    backgroundSize: '24px 24px',
  },
  {
    id: 'jaali_lattice',
    name: 'Mughal Geometric Jaali',
    css: (color) =>
      `radial-gradient(circle at 50% 50%, transparent 20%, ${parseColorToRgba(color, 0.8)} 21%, ${parseColorToRgba(color, 0.8)} 25%, transparent 26%), repeating-linear-gradient(45deg, transparent, transparent 15px, ${parseColorToRgba(color, 0.7)} 15px, ${parseColorToRgba(color, 0.7)} 17px)`,
    backgroundSize: '36px 36px',
  },
  {
    id: 'paisley_kalka',
    name: 'Royal Paisley & Kalka',
    css: (color) =>
      `radial-gradient(ellipse at 50% 50%, ${parseColorToRgba(color, 1.2)} 15%, transparent 16%), radial-gradient(circle at 80% 20%, ${parseColorToRgba(color, 0.9)} 8%, transparent 9%), radial-gradient(circle at 20% 80%, ${parseColorToRgba(color, 0.9)} 8%, transparent 9%)`,
    backgroundSize: '48px 48px',
  },
  {
    id: 'peacock_feather',
    name: 'Regal Peacock Plume',
    css: (color) =>
      `radial-gradient(circle at 50% 0%, ${parseColorToRgba(color, 1.3)} 18%, ${parseColorToRgba(color, 0.7)} 35%, transparent 55%), radial-gradient(circle at 50% 100%, ${parseColorToRgba(color, 1.1)} 18%, transparent 55%)`,
    backgroundSize: '50px 50px',
  },
  {
    id: 'marigold_garland',
    name: 'Festive Marigold Garland',
    css: (color) =>
      `radial-gradient(circle, ${parseColorToRgba(color, 1.4)} 12%, transparent 13%), radial-gradient(circle at 50% 0%, ${parseColorToRgba(color, 1.0)} 10%, transparent 11%), radial-gradient(circle at 50% 100%, ${parseColorToRgba(color, 1.0)} 10%, transparent 11%)`,
    backgroundSize: '28px 28px',
  },
  {
    id: 'golden_stars',
    name: 'Shubh Nakshatra Stars',
    css: (color) =>
      `radial-gradient(1px 1px at 20px 30px, ${parseColorToRgba(color, 1.6)}, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 70px, ${parseColorToRgba(color, 1.5)}, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, ${parseColorToRgba(color, 1.4)}, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, ${parseColorToRgba(color, 1.5)}, rgba(0,0,0,0))`,
    backgroundSize: '100px 100px',
  },
  {
    id: 'royal_stripes',
    name: 'Rajasthani Leheriya',
    css: (color) =>
      `repeating-linear-gradient(135deg, ${parseColorToRgba(color, 0.9)} 0px, ${parseColorToRgba(color, 0.9)} 2px, transparent 2px, transparent 18px), repeating-linear-gradient(45deg, ${parseColorToRgba(color, 0.4)} 0px, ${parseColorToRgba(color, 0.4)} 1px, transparent 1px, transparent 18px)`,
    backgroundSize: '26px 26px',
  },
  {
    id: 'temple_border',
    name: 'Temple Kanjeevaram Arch',
    css: (color) =>
      `repeating-linear-gradient(0deg, transparent, transparent 38px, ${parseColorToRgba(color, 1.2)} 38px, ${parseColorToRgba(color, 1.2)} 40px), repeating-linear-gradient(90deg, transparent, transparent 38px, ${parseColorToRgba(color, 1.2)} 38px, ${parseColorToRgba(color, 1.2)} 40px), radial-gradient(circle at 50% 50%, ${parseColorToRgba(color, 1.0)} 10%, transparent 11%)`,
    backgroundSize: '40px 40px',
  },
  {
    id: 'ivory_silk',
    name: 'Tussar Raw Silk Weave',
    css: (color) =>
      `repeating-linear-gradient(0deg, ${parseColorToRgba(color, 0.6)} 0px, ${parseColorToRgba(color, 0.6)} 1px, transparent 1px, transparent 6px), repeating-linear-gradient(90deg, ${parseColorToRgba(color, 0.6)} 0px, ${parseColorToRgba(color, 0.6)} 1px, transparent 1px, transparent 6px)`,
    backgroundSize: '12px 12px',
  },
  {
    id: 'none',
    name: 'Solid Pure Canvas',
    css: () => 'none',
    backgroundSize: 'auto',
  },
];

// Auspicious Invitation Motif / Header Icons
export const INVITATION_ICONS = [
  { id: 'crown', name: 'Royal Crown (Raj Tilak)', icon: Crown },
  { id: 'sparkles', name: 'Shubh Sparkles (Auspicious Aura)', icon: Sparkles },
  { id: 'flower2', name: 'Sacred Lotus (Padma Bloom)', icon: Flower2 },
  { id: 'flame', name: 'Agni Kund (Sacred Pheras)', icon: Flame },
  { id: 'heart', name: 'Prem Bandhan (Two Hearts)', icon: Heart },
  { id: 'music', name: 'Shehnai & Dhol (Sangeet Beats)', icon: Music },
  { id: 'wine', name: 'Celebration Toast (Cocktail Night)', icon: Wine },
  { id: 'sun', name: 'Surya Dev (Shubh Muhurat)', icon: Sun },
  { id: 'compass', name: 'Sacred Directions (Vastu & Journey)', icon: Compass },
  { id: 'gem', name: 'Ratna / Jewel (Eternal Bond)', icon: Gem },
  { id: 'star', name: 'Dhruva Tara (North Star)', icon: Star },
];

export const INVITE_TYPE_CONFIG: Record<
  EInvite['inviteType'],
  { label: string; description: string; badgeColor: string; defaultEventTypes: WeddingEvent['type'][] }
> = {
  whole_wedding: {
    label: 'Whole Wedding',
    description: 'Invites guests to all wedding celebrations and rituals.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    defaultEventTypes: ['haldi', 'mehendi', 'sangeet', 'wedding', 'reception', 'roka', 'cocktail', 'other'],
  },
  ceremony_only: {
    label: 'Just the Ceremony',
    description: 'Invites guests exclusively to the sacred Pheras and Wedding Muhurat.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    defaultEventTypes: ['wedding'],
  },
  initial_events: {
    label: 'Initial Events',
    description: 'Pre-wedding festivities: Haldi, Mehendi, Sangeet, and Roka.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    defaultEventTypes: ['mehendi', 'haldi', 'sangeet', 'roka'],
  },
  party_only: {
    label: 'Party Only',
    description: 'Invites guests to Cocktails, Sangeet after-party, and Grand Reception feast.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    defaultEventTypes: ['cocktail', 'sangeet', 'reception'],
  },
};

export const TEMPLATE_CONFIG: Record<
  'royal_palace' | 'mughal_floral' | 'regal_mandala' | 'contemporary_ivory',
  {
    name: string;
    description: string;
    accentColor: string;
    bgGradient: string;
    borderColor: string;
    primaryText: string;
    cardBg: string;
    icon: any;
  }
> = {
  royal_palace: {
    name: 'Royal Palace Arch',
    description: 'Rajasthan palace aesthetics with ornate gold foil arches, rich crimson tones, and regal heritage typography.',
    accentColor: '#D97706',
    bgGradient: 'from-[#7B1113] via-[#8B1E20] to-[#5C0A0B]',
    borderColor: '#D97706',
    primaryText: '#7B1113',
    cardBg: '#FFFDF9',
    icon: Crown,
  },
  mughal_floral: {
    name: 'Mughal Floral Trellis',
    description: 'Intricate Persian floral borders with emerald green, soft blush, and gold inlay accents.',
    accentColor: '#CA8A04',
    bgGradient: 'from-[#0F766E] via-[#115E59] to-[#134E4A]',
    borderColor: '#CA8A04',
    primaryText: '#0F766E',
    cardBg: '#F4FBFB',
    icon: Flower2,
  },
  regal_mandala: {
    name: 'Regal Sacred Mandala',
    description: 'Auspicious Vedic mandala watermark with saffron, marigold, and warm ambient candlelight glow.',
    accentColor: '#EA580C',
    bgGradient: 'from-[#C2410C] via-[#9A3412] to-[#7C2D12]',
    borderColor: '#EA580C',
    primaryText: '#9A3412',
    cardBg: '#FFFDF9',
    icon: Compass,
  },
  contemporary_ivory: {
    name: 'Contemporary Ivory',
    description: 'Modern champagne ivory minimalism with slate typography, clean micro-borders, and luxury monogram elegance.',
    accentColor: '#4F46E5',
    bgGradient: 'from-[#1E293B] via-[#0F172A] to-[#020617]',
    borderColor: '#94A3B8',
    primaryText: '#1E293B',
    cardBg: '#FFFFFF',
    icon: Layout,
  },
};

export const EInvitesManager: React.FC<EInvitesManagerProps> = ({ wedding }) => {
  const invites = useLiveQuery(
    () => db.eInvites.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );
  const events = useLiveQuery(
    () => db.events.where('weddingId').equals(wedding.id).sortBy('orderIndex'),
    [wedding.id]
  );

  // View state: 'designer' (3-column inline workbench) or 'list' (variants overview)
  const [activeView, setActiveView] = useState<'designer' | 'list'>('designer');
  const [activeInviteId, setActiveInviteId] = useState<string>('');
  const [editingInviteId, setEditingInviteId] = useState<string | null>(null);

  // Form states for Designer
  const [title, setTitle] = useState('Whole Wedding Celebrations');
  const [slug, setSlug] = useState('celebration');
  const [inviteType, setInviteType] = useState<EInvite['inviteType']>('whole_wedding');
  const [templateId, setTemplateId] = useState<
    'royal_palace' | 'mughal_floral' | 'regal_mandala' | 'contemporary_ivory'
  >('royal_palace');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [coverGreeting, setCoverGreeting] = useState('Together with their families');
  const [hostFamilyNames, setHostFamilyNames] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Custom theme colors & background pattern states
  const [useCustomTheme, setUseCustomTheme] = useState(false);
  const [themePrimary, setThemePrimary] = useState('#7B1113');
  const [themeSecondary, setThemeSecondary] = useState('#D97706');
  const [themeBackground, setThemeBackground] = useState('#FFFDF9');
  const [themeCardBg, setThemeCardBg] = useState('#FFFDF9');
  const [themeText, setThemeText] = useState('#271E1D');
  const [themeBorderColor, setThemeBorderColor] = useState('#D97706');
  const [themePatternColor, setThemePatternColor] = useState('rgba(217, 119, 6, 0.22)');
  const [patternBaseColor, setPatternBaseColor] = useState('#D97706');
  const [patternOpacity, setPatternOpacity] = useState(0.22);
  const [backgroundTheme, setBackgroundTheme] = useState<
    NonNullable<EInvite['backgroundTheme']>
  >('damask');
  const [iconOption, setIconOption] = useState<string>('crown');

  const [isExportingPng, setIsExportingPng] = useState(false);

  // Card reference for PNG capture
  const cardRef = useRef<HTMLDivElement>(null);

  const brideTerm = wedding.brideSideTerm || "Bride's Side (Ladkiwale)";
  const groomTerm = wedding.groomSideTerm || "Groom's Side (Ladkewale)";

  // Load existing invite data into designer form
  const loadInviteIntoForm = (inv: EInvite) => {
    setEditingInviteId(inv.id);
    setActiveInviteId(inv.id);
    setTitle(inv.title);
    setSlug(inv.slug);
    setInviteType(inv.inviteType || 'whole_wedding');
    setIconOption(inv.iconOption || 'crown');
    setTemplateId(
      inv.templateId ||
        (inv.templateStyle === 'floral_mughal'
          ? 'mughal_floral'
          : inv.templateStyle === 'palace_arch'
          ? 'royal_palace'
          : inv.templateStyle === 'modern_minimal'
          ? 'contemporary_ivory'
          : 'regal_mandala')
    );
    setSelectedEventIds(inv.includedEventIds || []);
    setCoverGreeting(inv.coverGreeting || 'Together with their families');
    setHostFamilyNames(inv.hostFamilyNames || `${wedding.brideSideName} & ${wedding.groomSideName}`);
    setCustomMessage(
      inv.customMessage ||
        `Request the pleasure of your company as ${wedding.brideName} & ${wedding.groomName} tie the sacred knot.`
    );
    setRsvpPhone(inv.rsvpPhone || '');
    setGoogleMapsUrl(inv.googleMapsUrl || '');

    if (inv.themeColors) {
      setUseCustomTheme(true);
      setThemePrimary(inv.themeColors.primary);
      setThemeSecondary(inv.themeColors.secondary);
      setThemeBackground(inv.themeColors.background);
      setThemeCardBg(inv.themeColors.cardBg || '#FFFDF9');
      setThemeText(inv.themeColors.text);
      setThemeBorderColor(inv.themeColors.borderColor || inv.themeColors.secondary);
      
      const patCol = inv.themeColors.patternColor || `rgba(217, 119, 6, 0.22)`;
      setThemePatternColor(patCol);
      const match = patCol.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        setPatternBaseColor(`#${r}${g}${b}`);
        setPatternOpacity(parseFloat(match[4]));
      } else if (patCol.startsWith('#')) {
        setPatternBaseColor(patCol);
        setPatternOpacity(0.22);
      }
    } else {
      setUseCustomTheme(false);
      const defaultPal = COLOR_PALETTES[0];
      setThemePrimary(defaultPal.primary);
      setThemeSecondary(defaultPal.secondary);
      setThemeBackground(defaultPal.background);
      setThemeCardBg(defaultPal.cardBg);
      setThemeText(defaultPal.text);
      setThemeBorderColor(defaultPal.borderColor);
      setPatternBaseColor(defaultPal.secondary);
      setThemePatternColor(hexAndOpacityToRgba(defaultPal.secondary, 0.22));
      setPatternOpacity(0.22);
    }

    setBackgroundTheme(inv.backgroundTheme || 'damask');
  };

  // Initialize or sync with active invite when loaded
  useEffect(() => {
    if (invites && invites.length > 0 && !editingInviteId && !activeInviteId) {
      const first = invites[0];
      loadInviteIntoForm(first);
    } else if (events && selectedEventIds.length === 0 && !editingInviteId) {
      setSelectedEventIds(events.map((e) => e.id));
      setHostFamilyNames(`${wedding.brideSideName} & ${wedding.groomSideName}`);
      setCustomMessage(
        `Request the pleasure of your company as ${wedding.brideName} & ${wedding.groomName} tie the sacred knot.`
      );
      setGoogleMapsUrl(`https://maps.google.com/?q=${encodeURIComponent(wedding.venue + ' ' + wedding.city)}`);
    }
  }, [invites, events]);

  // Auto-filter events based on invite type
  const handleInviteTypeSelect = (newType: EInvite['inviteType']) => {
    setInviteType(newType);
    if (!events) return;

    const allowedTypes = INVITE_TYPE_CONFIG[newType].defaultEventTypes;
    const matchingEventIds = events
      .filter((ev) => allowedTypes.includes(ev.type))
      .map((ev) => ev.id);

    setSelectedEventIds(matchingEventIds.length > 0 ? matchingEventIds : events.map((e) => e.id));

    // Update title suggestion if default-like
    if (!editingInviteId) {
      if (newType === 'whole_wedding') {
        setTitle('Whole Wedding Celebrations');
        setSlug('whole-wedding');
      } else if (newType === 'ceremony_only') {
        setTitle('Wedding Ceremony & Muhurat');
        setSlug('ceremony-only');
      } else if (newType === 'initial_events') {
        setTitle('Pre-Wedding Celebrations');
        setSlug('pre-wedding');
      } else if (newType === 'party_only') {
        setTitle('Cocktail & Grand Reception');
        setSlug('reception-party');
      }
    }
  };

  const applyColorPalette = (palette: (typeof COLOR_PALETTES)[0]) => {
    setThemePrimary(palette.primary);
    setThemeSecondary(palette.secondary);
    setThemeBackground(palette.background);
    setThemeCardBg(palette.cardBg);
    setThemeText(palette.text);
    setThemeBorderColor(palette.borderColor);
    setPatternBaseColor(palette.secondary);
    setThemePatternColor(hexAndOpacityToRgba(palette.secondary, patternOpacity));
    setUseCustomTheme(true);
  };

  const startNewInvite = () => {
    setEditingInviteId(null);
    setTitle('Whole Wedding Celebrations');
    setSlug(`invite-${Date.now().toString().slice(-4)}`);
    setInviteType('whole_wedding');
    setTemplateId('royal_palace');
    setSelectedEventIds(events?.map((e) => e.id) || []);
    setCoverGreeting('Together with their families');
    setHostFamilyNames(`${wedding.brideSideName} & ${wedding.groomSideName}`);
    setCustomMessage(
      `Request the pleasure of your company as ${wedding.brideName} & ${wedding.groomName} tie the sacred knot.`
    );
    setRsvpPhone('+91 98000 00000');
    setGoogleMapsUrl(`https://maps.google.com/?q=${encodeURIComponent(wedding.venue + ' ' + wedding.city)}`);

    const defaultPal = COLOR_PALETTES[0];
    setUseCustomTheme(false);
    setThemePrimary(defaultPal.primary);
    setThemeSecondary(defaultPal.secondary);
    setThemeBackground(defaultPal.background);
    setThemeCardBg(defaultPal.cardBg);
    setThemeText(defaultPal.text);
    setThemeBorderColor(defaultPal.borderColor);
    setPatternBaseColor(defaultPal.secondary);
    setThemePatternColor(hexAndOpacityToRgba(defaultPal.secondary, 0.22));
    setPatternOpacity(0.22);
    setBackgroundTheme('damask');

    setActiveView('designer');
  };

  const handleSaveInvite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert('Please provide a title and URL slug for this invite.');
      return;
    }

    const inviteRecord: EInvite = {
      id: editingInviteId || `inv-${wedding.id}-${Date.now()}`,
      weddingId: wedding.id,
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      inviteType,
      templateId,
      templateStyle:
        templateId === 'royal_palace'
          ? 'palace_arch'
          : templateId === 'mughal_floral'
          ? 'floral_mughal'
          : templateId === 'contemporary_ivory'
          ? 'modern_minimal'
          : 'royal_mandala',
      includedEventIds: selectedEventIds,
      coverGreeting: coverGreeting.trim(),
      hostFamilyNames: hostFamilyNames.trim(),
      customMessage: customMessage.trim(),
      themeColors: useCustomTheme
        ? {
            primary: themePrimary,
            secondary: themeSecondary,
            background: themeBackground,
            text: themeText,
            cardBg: themeCardBg,
            borderColor: themeBorderColor,
            patternColor: themePatternColor,
          }
        : undefined,
      backgroundTheme,
      iconOption,
      rsvpPhone: rsvpPhone.trim() || undefined,
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      createdAt: Date.now(),
    };

    await db.eInvites.put(inviteRecord);
    setEditingInviteId(inviteRecord.id);
    setActiveInviteId(inviteRecord.id);
    alert('E-Invite variant successfully saved!');
  };

  const handleDeleteInvite = async (id: string) => {
    if (confirm('Delete this e-invite variant?')) {
      await db.eInvites.delete(id);
      if (editingInviteId === id) {
        setEditingInviteId(null);
        if (invites && invites.length > 1) {
          const remaining = invites.filter((inv) => inv.id !== id);
          loadInviteIntoForm(remaining[0]);
        }
      }
    }
  };

  // Download High-Res PNG without scrollbars or clipped content
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    try {
      setIsExportingPng(true);
      // Wait a tick for react to remove max-h or scrollbars if any
      await new Promise((res) => setTimeout(res, 80));

      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `${wedding.brideName}-${wedding.groomName}-${slug || 'invite'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Failed to generate PNG image.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // Export Standalone Interactive HTML package
  const handleExportHtml = () => {
    const defaultTmpl = TEMPLATE_CONFIG[templateId];
    const colors = {
      primary: useCustomTheme ? themePrimary : defaultTmpl.primaryText,
      secondary: useCustomTheme ? themeSecondary : defaultTmpl.accentColor,
      background: useCustomTheme ? themeBackground : defaultTmpl.cardBg,
      cardBg: useCustomTheme ? themeCardBg : '#FFFDF9',
      text: useCustomTheme ? themeText : '#271E1D',
      borderColor: useCustomTheme ? themeBorderColor : defaultTmpl.borderColor,
      patternColor: useCustomTheme ? themePatternColor : defaultTmpl.accentColor,
    };

    const patternObj =
      BACKGROUND_PATTERNS.find((p) => p.id === backgroundTheme) || BACKGROUND_PATTERNS[0];
    const patternCss = patternObj.css(colors.patternColor);

    const includedEvents = events?.filter((ev) => selectedEventIds.includes(ev.id)) || [];

    const eventsHtml = includedEvents
      .map(
        (ev) => `
        <div style="background: rgba(255,255,255,0.92); border: 1px solid ${colors.borderColor}40; border-radius: 16px; padding: 16px; margin-bottom: 12px; text-align: left; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <div style="font-weight: 700; color: ${colors.primary}; font-size: 16px;">${ev.name}</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">${ev.date} &bull; ${ev.startTime} to ${ev.endTime}</div>
          <div style="font-size: 13px; color: #333; margin-top: 4px;"><strong>Venue:</strong> ${ev.venue}</div>
          ${ev.dressCode ? `<div style="font-size: 12px; color: ${colors.secondary}; margin-top: 4px;"><strong>Dress Code:</strong> ${ev.dressCode}</div>` : ''}
          ${ev.notes ? `<div style="font-size: 12px; color: #777; font-style: italic; margin-top: 4px;">"${ev.notes}"</div>` : ''}
        </div>
      `
      )
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${wedding.brideName} & ${wedding.groomName} — ${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 32px 16px;
      font-family: 'Inter', sans-serif;
      background-color: ${colors.background};
      color: ${colors.text};
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      max-width: 560px;
      width: 100%;
      background: ${colors.cardBg};
      background-image: ${patternCss};
      background-size: ${patternObj.backgroundSize || 'auto'};
      border: 4px solid ${colors.borderColor};
      border-radius: 28px;
      padding: 40px 28px;
      text-align: center;
      box-shadow: 0 24px 48px rgba(0,0,0,0.14);
      position: relative;
      box-sizing: border-box;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 34px;
      color: ${colors.primary};
      margin: 12px 0 6px;
    }
    .greeting {
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: ${colors.secondary};
      font-weight: 700;
    }
    .families {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
    }
    .message {
      font-size: 14px;
      color: #444;
      font-style: italic;
      line-height: 1.6;
      margin: 20px 0;
      padding: 12px 0;
      border-top: 1px solid ${colors.borderColor}40;
      border-bottom: 1px solid ${colors.borderColor}40;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="greeting">${coverGreeting}</div>
    <h1>${wedding.brideName} &amp; ${wedding.groomName}</h1>
    <div class="families">${hostFamilyNames}</div>
    <div class="message">"${customMessage}"</div>
    <div class="events">${eventsHtml}</div>
    <div style="margin-top: 24px; font-size: 13px; color: #555;">
      <strong>Venue:</strong> ${wedding.venue}, ${wedding.city}<br>
      ${rsvpPhone ? `<strong>RSVP:</strong> ${rsvpPhone}` : ''}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${wedding.brideName}-${wedding.groomName}-${slug}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // WhatsApp Invite Text Generator
  const handleCopyWhatsApp = () => {
    const includedEvents = events?.filter((ev) => selectedEventIds.includes(ev.id)) || [];

    let msg = `🌸 *WEDDING INVITATION* 🌸\n\n`;
    msg += `*${coverGreeting}*\n\n`;
    msg += `✨ *${wedding.brideName} & ${wedding.groomName}* ✨\n`;
    msg += `(${hostFamilyNames})\n\n`;
    msg += `"${customMessage}"\n\n`;
    msg += `🗓️ *CELEBRATIONS & ITINERARY:*\n`;

    for (const ev of includedEvents) {
      msg += `\n📍 *${ev.name}*\n`;
      msg += `• Date: ${ev.date} (${ev.startTime} - ${ev.endTime})\n`;
      msg += `• Venue: ${ev.venue}\n`;
      if (ev.dressCode) msg += `• Dress Code: ${ev.dressCode}\n`;
    }

    msg += `\n🏛️ *Primary Venue:* ${wedding.venue}, ${wedding.city}\n`;
    if (googleMapsUrl) msg += `🗺️ *Location Map:* ${googleMapsUrl}\n`;
    if (rsvpPhone) msg += `📞 *RSVP Contact:* ${rsvpPhone}\n`;

    navigator.clipboard.writeText(msg);
    alert('Invitation formatted text copied to clipboard! Ready to paste into WhatsApp.');
  };

  // Current visual configurations for real-time live preview
  const baseTemplateConfig = TEMPLATE_CONFIG[templateId] || TEMPLATE_CONFIG.royal_palace;
  const activeTypeConfig = INVITE_TYPE_CONFIG[inviteType];

  const effectiveTheme = {
    primaryText: useCustomTheme ? themePrimary : baseTemplateConfig.primaryText,
    accentColor: useCustomTheme ? themeSecondary : baseTemplateConfig.accentColor,
    borderColor: useCustomTheme ? themeBorderColor : baseTemplateConfig.borderColor,
    cardBg: useCustomTheme ? themeCardBg : baseTemplateConfig.cardBg,
    background: useCustomTheme ? themeBackground : '#F8FAFC',
    text: useCustomTheme ? themeText : '#271E1D',
    patternColor: useCustomTheme ? themePatternColor : baseTemplateConfig.accentColor,
  };

  const currentPattern =
    BACKGROUND_PATTERNS.find((p) => p.id === backgroundTheme) || BACKGROUND_PATTERNS[0];
  const activePatternCss = currentPattern.css(effectiveTheme.patternColor);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & View Navigation */}
      <div className="bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-bold font-serif text-theme-text-main">
                Digital E-Invites & Theme Designer
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Pillar 7: 3-column studio with real-time live preview, cohort ceremony grouping, cultural palettes, watermark themes, and unclipped PNG export.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-theme-background border border-theme-border rounded-xl p-1">
              <button
                type="button"
                onClick={() => setActiveView('designer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'designer'
                    ? 'bg-theme-card text-theme-primary shadow-xs'
                    : 'text-theme-text-muted hover:text-theme-text-main'
                }`}
              >
                3-Col Studio
              </button>
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'list'
                    ? 'bg-theme-card text-theme-primary shadow-xs'
                    : 'text-theme-text-muted hover:text-theme-text-main'
                }`}
              >
                All Variants ({invites?.length || 0})
              </button>
            </div>

            <button
              onClick={startNewInvite}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow hover:bg-theme-primary-hover transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Variant</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE A: 3-COLUMN INLINE DESIGNER STUDIO */}
      {activeView === 'designer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* COLUMN 1: DATA & CONTENT (Cohort, Ceremonies, Details)    */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-5 bg-theme-card border border-theme-border p-5 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between border-b border-theme-border/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-theme-primary/10 text-theme-primary text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-serif font-bold text-sm text-theme-text-main">
                  Data & Ceremony Cohort
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-theme-text-muted">
                Step 1 of 2
              </span>
            </div>

            {/* 1.1 Cohort Audience / Invitation Type */}
            <div className="space-y-1">
              <CustomSelect
                label="1. Invitation Cohort Audience"
                value={inviteType}
                onChange={(val) => handleInviteTypeSelect(val as EInvite['inviteType'])}
                options={(Object.keys(INVITE_TYPE_CONFIG) as Array<EInvite['inviteType']>).map((typeKey) => {
                  const cfg = INVITE_TYPE_CONFIG[typeKey];
                  return {
                    value: typeKey,
                    label: cfg.label,
                    description: cfg.description,
                    icon: <Mail className="w-3.5 h-3.5 text-theme-primary" />,
                    badge: `${cfg.defaultEventTypes.length} types`,
                  };
                })}
              />
            </div>

            {/* 1.2 Included Ceremonies & Events (Placed directly below Cohort as requested) */}
            <div className="space-y-2 p-3.5 rounded-2xl border border-theme-border bg-theme-background/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-theme-primary" />
                  <span>2. Included Ceremonies & Events ({selectedEventIds.length})</span>
                </label>
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedEventIds(events?.map((e) => e.id) || [])}
                    className="text-theme-primary font-bold hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-theme-text-muted">&bull;</span>
                  <button
                    type="button"
                    onClick={() => setSelectedEventIds([])}
                    className="text-theme-text-muted hover:text-theme-text-main"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {events?.map((ev) => {
                  const isChecked = selectedEventIds.includes(ev.id);
                  return (
                    <label
                      key={ev.id}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-theme-primary bg-theme-card font-semibold text-theme-text-main'
                          : 'border-theme-border/80 bg-theme-background/40 text-theme-text-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEventIds([...selectedEventIds, ev.id]);
                            } else {
                              setSelectedEventIds(selectedEventIds.filter((id) => id !== ev.id));
                            }
                          }}
                          className="rounded text-theme-primary focus:ring-theme-primary"
                        />
                        <span className="truncate">{ev.name}</span>
                      </div>
                      <span className="text-[10px] text-theme-text-muted shrink-0 ml-1">
                        {ev.date}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 1.3 Title & URL Slug */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Title / Label *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Whole Wedding Celebrations"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. whole-wedding"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* 1.4 Greetings & Host Families */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Opening Greeting</label>
                <input
                  type="text"
                  value={coverGreeting}
                  onChange={(e) => setCoverGreeting(e.target.value)}
                  placeholder="e.g. Together with their families"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Host Families</label>
                <input
                  type="text"
                  value={hostFamilyNames}
                  onChange={(e) => setHostFamilyNames(e.target.value)}
                  placeholder={`${brideTerm} & ${groomTerm}`}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs"
                />
              </div>
            </div>

            {/* 1.5 Custom Invitation Message */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-theme-text-main">Invitation Message</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Request the honor of your presence..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs resize-none"
              />
            </div>

            {/* 1.6 RSVP & Maps Link */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">RSVP Contact</label>
                <input
                  type="tel"
                  value={rsvpPhone}
                  onChange={(e) => setRsvpPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Google Maps URL</label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: VISUALS & STYLING (Templates, Palettes, Patterns) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-5 bg-theme-card border border-theme-border p-5 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between border-b border-theme-border/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-theme-secondary/15 text-theme-secondary text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-serif font-bold text-sm text-theme-text-main">
                  Visual Theme & Aesthetics
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-theme-text-muted">
                Step 2 of 2
              </span>
            </div>

            {/* 2.1 Design Template (4 Aesthetic Styles) */}
            <div className="space-y-1">
              <CustomSelect
                label="1. Visual Design Template"
                value={templateId}
                onChange={(val) => {
                  const tId = val as 'royal_palace' | 'mughal_floral' | 'regal_mandala' | 'contemporary_ivory';
                  setTemplateId(tId);
                  if (!useCustomTheme) {
                    const cfg = TEMPLATE_CONFIG[tId];
                    if (cfg) {
                      setThemePrimary(cfg.primaryText);
                      setThemeSecondary(cfg.accentColor);
                      setThemeBorderColor(cfg.borderColor);
                      setThemeCardBg(cfg.cardBg);
                    }
                  }
                }}
                options={(
                  Object.keys(TEMPLATE_CONFIG) as Array<
                    'royal_palace' | 'mughal_floral' | 'regal_mandala' | 'contemporary_ivory'
                  >
                ).map((tmplKey) => {
                  const cfg = TEMPLATE_CONFIG[tmplKey];
                  const TmplIcon = cfg.icon;
                  return {
                    value: tmplKey,
                    label: cfg.name,
                    description: cfg.description,
                    icon: <TmplIcon className="w-4 h-4" style={{ color: cfg.accentColor }} />,
                  };
                })}
              />
            </div>

            {/* 2.2 Auspicious Header Motif Icon */}
            <div className="space-y-1">
              <CustomSelect
                label="2. Auspicious Motif / Header Icon"
                value={iconOption}
                onChange={(val) => setIconOption(val)}
                options={INVITATION_ICONS.map((ico) => {
                  const IcoComp = ico.icon;
                  return {
                    value: ico.id,
                    label: ico.name,
                    icon: <IcoComp className="w-4 h-4 text-theme-primary" />,
                  };
                })}
              />
            </div>

            {/* 2.3 Cultural Color Palettes */}
            <div className="space-y-2.5 p-3.5 rounded-2xl border border-theme-border bg-theme-background/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-theme-primary" />
                  <span>3. Cultural Color Palette</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomTheme}
                    onChange={(e) => setUseCustomTheme(e.target.checked)}
                    className="rounded text-theme-primary focus:ring-theme-primary"
                  />
                  <span className="text-theme-text-muted text-[11px]">Custom Mode</span>
                </label>
              </div>

              {/* Pre-defined Cultural Palettes via CustomSelect */}
              <CustomSelect
                value={COLOR_PALETTES.find((p) => p.primary === themePrimary)?.id || 'custom'}
                onChange={(val) => {
                  const found = COLOR_PALETTES.find((p) => p.id === val);
                  if (found) applyColorPalette(found);
                }}
                options={COLOR_PALETTES.map((pal) => ({
                  value: pal.id,
                  label: pal.name,
                  colorSwatch: [pal.primary, pal.secondary, pal.borderColor],
                }))}
              />

              {/* Granular Color Pickers (Visible when custom theme enabled) */}
              {useCustomTheme && (
                <div className="pt-2 border-t border-theme-border/60 grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-theme-text-muted block">
                      Primary (Headings)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themePrimary}
                        onChange={(e) => setThemePrimary(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
                      />
                      <input
                        type="text"
                        value={themePrimary}
                        onChange={(e) => setThemePrimary(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-theme-border bg-theme-card"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-theme-text-muted block">
                      Accent / Gold
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeSecondary}
                        onChange={(e) => setThemeSecondary(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
                      />
                      <input
                        type="text"
                        value={themeSecondary}
                        onChange={(e) => setThemeSecondary(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-theme-border bg-theme-card"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-theme-text-muted block">
                      Card Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeCardBg}
                        onChange={(e) => setThemeCardBg(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
                      />
                      <input
                        type="text"
                        value={themeCardBg}
                        onChange={(e) => setThemeCardBg(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-theme-border bg-theme-card"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-theme-text-muted block">
                      Card Border
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeBorderColor}
                        onChange={(e) => setThemeBorderColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
                      />
                      <input
                        type="text"
                        value={themeBorderColor}
                        onChange={(e) => setThemeBorderColor(e.target.value)}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-theme-border bg-theme-card"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2.4 Background Watermark Pattern (14 Patterns) */}
            <div className="space-y-3 p-3.5 rounded-2xl border border-theme-border bg-theme-background/60">
              <CustomSelect
                label="4. Background Watermark Pattern"
                value={backgroundTheme}
                onChange={(val) => setBackgroundTheme(val as any)}
                options={BACKGROUND_PATTERNS.map((pat) => ({
                  value: pat.id,
                  label: pat.name,
                  icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
                  description:
                    pat.id === 'none'
                      ? 'Clean background without pattern'
                      : 'Ceremonial repeating watermark',
                }))}
              />

              {/* Dedicated Watermark Pattern Color & Opacity (RGBA) */}
              {backgroundTheme !== 'none' && (
                <div className="pt-2.5 border-t border-theme-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-theme-text-main flex items-center gap-1">
                      <Palette className="w-3 h-3 text-theme-secondary" />
                      <span>Watermark Pattern Color & Opacity (RGBA)</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-theme-primary bg-theme-card px-2 py-0.5 rounded-md border border-theme-border">
                      {Math.round(patternOpacity * 100)}% Opacity
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-theme-text-muted">Base Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={patternBaseColor}
                          onChange={(e) => {
                            const newBase = e.target.value;
                            setPatternBaseColor(newBase);
                            setThemePatternColor(hexAndOpacityToRgba(newBase, patternOpacity));
                            setUseCustomTheme(true);
                          }}
                          className="w-7 h-7 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
                        />
                        <input
                          type="text"
                          value={patternBaseColor}
                          onChange={(e) => {
                            const newBase = e.target.value;
                            setPatternBaseColor(newBase);
                            if (newBase.startsWith('#') && (newBase.length === 4 || newBase.length === 7)) {
                              setThemePatternColor(hexAndOpacityToRgba(newBase, patternOpacity));
                              setUseCustomTheme(true);
                            }
                          }}
                          className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-theme-border bg-theme-card"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-theme-text-muted">RGBA Output</label>
                      <input
                        type="text"
                        value={themePatternColor}
                        onChange={(e) => {
                          setThemePatternColor(e.target.value);
                          setUseCustomTheme(true);
                        }}
                        className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-theme-border bg-theme-card"
                        placeholder="rgba(217, 119, 6, 0.22)"
                      />
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-theme-text-muted">
                      <span>Subtle Watermark</span>
                      <span>Bold Pattern</span>
                    </div>
                    <input
                      type="range"
                      min="0.02"
                      max="0.80"
                      step="0.02"
                      value={patternOpacity}
                      onChange={(e) => {
                        const newOp = parseFloat(e.target.value);
                        setPatternOpacity(newOp);
                        setThemePatternColor(hexAndOpacityToRgba(patternBaseColor, newOp));
                        setUseCustomTheme(true);
                      }}
                      className="w-full accent-theme-primary cursor-pointer"
                    />
                  </div>

                  {/* Quick Opacity presets */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-theme-text-muted">Presets:</span>
                    {[0.08, 0.18, 0.30, 0.50].map((op) => (
                      <button
                        type="button"
                        key={op}
                        onClick={() => {
                          setPatternOpacity(op);
                          setThemePatternColor(hexAndOpacityToRgba(patternBaseColor, op));
                          setUseCustomTheme(true);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          Math.abs(patternOpacity - op) < 0.03
                            ? 'bg-theme-primary text-white border-theme-primary'
                            : 'bg-theme-card border-theme-border text-theme-text-muted hover:text-theme-text-main'
                        }`}
                      >
                        {Math.round(op * 100)}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save & Reset Actions */}
            <div className="pt-2 border-t border-theme-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-3.5 py-2 rounded-xl border border-theme-border bg-theme-background text-xs font-semibold text-theme-text-muted hover:text-theme-text-main"
              >
                Browse List
              </button>

              <button
                type="button"
                onClick={() => handleSaveInvite()}
                className="px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold shadow-md hover:bg-theme-primary-hover transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Invite Variant</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 3: PERSISTENT LIVE PREVIEW & EXPORT ACTIONS        */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4 sticky top-6">
            {/* Quick Export Action Bar */}
            <div className="bg-theme-card border border-theme-border p-3 rounded-2xl shadow-2xs flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-theme-primary" />
                <span>Live Card Preview</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isExportingPng}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-theme-border bg-theme-background hover:bg-theme-border/40 text-[11px] font-semibold text-theme-text-main transition-colors shadow-2xs"
                  title="Download full unclipped PNG"
                >
                  <ImageIcon className="w-3 h-3 text-theme-secondary" />
                  <span>{isExportingPng ? 'Rendering...' : 'PNG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportHtml}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-theme-border bg-theme-background hover:bg-theme-border/40 text-[11px] font-semibold text-theme-text-main transition-colors shadow-2xs"
                  title="Export HTML standalone file"
                >
                  <FileCode className="w-3 h-3 text-theme-primary" />
                  <span>HTML</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors shadow-2xs"
                  title="Copy WhatsApp invitation text"
                >
                  <Copy className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Real-time Rendered Live Invitation Card */}
            <div
              className="p-3 sm:p-4 rounded-3xl border border-theme-border shadow-md"
              style={{
                backgroundColor: effectiveTheme.background,
              }}
            >
              <div
                ref={cardRef}
                className="w-full rounded-2xl p-6 sm:p-7 shadow-xl text-center space-y-5 relative overflow-visible transition-all border-4"
                style={{
                  backgroundColor: effectiveTheme.cardBg,
                  borderColor: effectiveTheme.borderColor,
                  backgroundImage: activePatternCss,
                  backgroundSize: currentPattern.backgroundSize || 'auto',
                  minHeight: '520px',
                }}
              >
                {/* Corner Ornaments */}
                <div
                  className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2"
                  style={{ borderColor: effectiveTheme.borderColor }}
                />
                <div
                  className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2"
                  style={{ borderColor: effectiveTheme.borderColor }}
                />
                <div
                  className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2"
                  style={{ borderColor: effectiveTheme.borderColor }}
                />
                <div
                  className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2"
                  style={{ borderColor: effectiveTheme.borderColor }}
                />

                {/* Decorative Arch Emblem */}
                {(() => {
                  const IconComp = INVITATION_ICONS.find((i) => i.id === iconOption)?.icon || Crown;
                  return (
                    <div
                      className="w-12 h-12 mx-auto rounded-full border flex items-center justify-center shadow-xs"
                      style={{
                        borderColor: effectiveTheme.borderColor,
                        backgroundColor: `${effectiveTheme.borderColor}15`,
                      }}
                    >
                      <IconComp className="w-6 h-6" style={{ color: effectiveTheme.borderColor }} />
                    </div>
                  );
                })()}

                {/* Greeting & Couple Names */}
                <div className="space-y-1">
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold block"
                    style={{ color: effectiveTheme.accentColor }}
                  >
                    {coverGreeting || 'Together with their families'}
                  </span>
                  <h1
                    className="font-serif font-bold text-2xl sm:text-3xl tracking-tight"
                    style={{ color: effectiveTheme.primaryText }}
                  >
                    {wedding.brideName} & {wedding.groomName}
                  </h1>
                  <p className="text-[11px] text-stone-600 font-medium">
                    {hostFamilyNames || `${wedding.brideSideName} & ${wedding.groomSideName}`}
                  </p>
                </div>

                {/* Custom Inviting Message */}
                <p
                  className="text-xs text-stone-700 italic max-w-sm mx-auto leading-relaxed py-2 border-y"
                  style={{ borderColor: `${effectiveTheme.borderColor}40` }}
                >
                  "{customMessage}"
                </p>

                {/* Selected Events Schedule (Full height, unclipped) */}
                <div className="space-y-2.5 pt-1">
                  <h3
                    className="font-serif font-bold text-[11px] uppercase tracking-wider"
                    style={{ color: effectiveTheme.primaryText }}
                  >
                    Celebrations Schedule ({activeTypeConfig.label})
                  </h3>

                  <div className="space-y-2">
                    {events
                      ?.filter((ev) => selectedEventIds.includes(ev.id))
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="bg-white/90 border rounded-xl p-2.5 text-left shadow-2xs space-y-0.5"
                          style={{ borderColor: `${effectiveTheme.borderColor}30` }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="font-bold text-xs"
                              style={{ color: effectiveTheme.primaryText }}
                            >
                              {ev.name}
                            </span>
                            <span className="text-[10px] text-stone-500 font-medium">
                              {ev.startTime} - {ev.endTime}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-600 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{ev.date}</span>
                            <span>&bull;</span>
                            <span className="truncate">{ev.venue}</span>
                          </div>
                          {ev.dressCode && (
                            <div
                              className="text-[9px] italic font-medium"
                              style={{ color: effectiveTheme.accentColor }}
                            >
                              Dress Code: {ev.dressCode}
                            </div>
                          )}
                        </div>
                      ))}
                    {selectedEventIds.length === 0 && (
                      <p className="text-[11px] text-stone-400 italic py-2">
                        No ceremonies selected for this variant.
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Details */}
                <div
                  className="pt-2 border-t space-y-1.5"
                  style={{ borderColor: `${effectiveTheme.borderColor}40` }}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-800">
                    <MapPin className="w-3 h-3 text-rose-700" />
                    <span>
                      {wedding.venue}, {wedding.city}
                    </span>
                  </div>
                  {rsvpPhone && (
                    <div className="text-[10px] text-stone-600">
                      RSVP: <strong className="text-stone-900">{rsvpPhone}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE B: ALL VARIANTS OVERVIEW LIST */}
      {activeView === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-theme-text-main">
              Configured Invitation Variants ({invites?.length || 0})
            </h3>
            <button
              onClick={startNewInvite}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow hover:bg-theme-primary-hover"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Another Variant</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invites?.map((inv) => {
              const typeCfg = INVITE_TYPE_CONFIG[inv.inviteType || 'whole_wedding'];
              const currentTmpl =
                inv.templateId ||
                (inv.templateStyle === 'floral_mughal'
                  ? 'mughal_floral'
                  : inv.templateStyle === 'palace_arch'
                  ? 'royal_palace'
                  : inv.templateStyle === 'modern_minimal'
                  ? 'contemporary_ivory'
                  : 'regal_mandala');
              const tmplCfg = TEMPLATE_CONFIG[currentTmpl] || TEMPLATE_CONFIG.royal_palace;
              const TmplIcon = tmplCfg.icon;

              return (
                <div
                  key={inv.id}
                  className="bg-theme-card border border-theme-border rounded-2xl p-4 shadow-2xs hover:border-theme-primary transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${typeCfg.badgeColor}`}
                      >
                        {typeCfg.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-theme-background border border-theme-border text-theme-text-muted">
                        <TmplIcon className="w-2.5 h-2.5" />
                        <span>{tmplCfg.name.split(' ')[0]}</span>
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-theme-text-main">
                      {inv.title}
                    </h4>

                    <p className="text-xs text-theme-text-muted line-clamp-2">
                      "{inv.customMessage}"
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-theme-border/60">
                    <div className="flex items-center justify-between text-[11px] text-theme-text-muted">
                      <span>{inv.includedEventIds?.length || 0} Ceremonies</span>
                      <span className="font-mono text-[10px] text-theme-primary">/{inv.slug}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => {
                          loadInviteIntoForm(inv);
                          setActiveView('designer');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-theme-primary hover:underline"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit in 3-Col Studio</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            loadInviteIntoForm(inv);
                            setActiveView('designer');
                            setTimeout(() => handleDownloadPng(), 200);
                          }}
                          className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-primary hover:bg-theme-background"
                          title="Download PNG"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvite(inv.id)}
                          className="p-1.5 rounded-lg text-theme-text-muted hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {(!invites || invites.length === 0) && (
              <div className="col-span-full py-12 text-center bg-theme-card border-2 border-dashed border-theme-border rounded-3xl space-y-3">
                <Mail className="w-10 h-10 text-theme-text-muted mx-auto" />
                <h4 className="font-serif font-bold text-sm text-theme-text-main">
                  No E-Invite Variants Yet
                </h4>
                <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
                  Create customized invitation variants for specific guest groups with their included ceremonies.
                </p>
                <button
                  onClick={startNewInvite}
                  className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Variant</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
