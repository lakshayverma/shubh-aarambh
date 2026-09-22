import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Wedding, EInvite, WeddingEvent, GuestParty } from '../../db/schema';
import { toPng } from 'html-to-image';
import {
  Mail,
  Plus,
  Edit2,
  Trash2,
  Download,
  Share2,
  MessageCircle,
  ExternalLink,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Shirt,
  Phone,
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
  Send,
  Sliders,
  Maximize2,
} from 'lucide-react';

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
    cardBg: '#FFFFFF',
    text: '#271E1D',
    borderColor: '#D97706',
  },
  {
    id: 'mughal_emerald',
    name: 'Mughal Emerald',
    primary: '#0F766E',
    secondary: '#CA8A04',
    background: '#F0FDF4',
    cardBg: '#FFFFFF',
    text: '#134E4A',
    borderColor: '#CA8A04',
  },
  {
    id: 'saffron_marigold',
    name: 'Saffron Sunset',
    primary: '#C2410C',
    secondary: '#EAB308',
    background: '#FFFBEB',
    cardBg: '#FFFFFF',
    text: '#431407',
    borderColor: '#EA580C',
  },
  {
    id: 'pastel_romance',
    name: 'Blush & Gold',
    primary: '#BE185D',
    secondary: '#F59E0B',
    background: '#FDF2F8',
    cardBg: '#FFFFFF',
    text: '#831843',
    borderColor: '#F472B6',
  },
  {
    id: 'midnight_sapphire',
    name: 'Midnight Sapphire',
    primary: '#1E3A8A',
    secondary: '#F59E0B',
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

// Background Themes / Patterns
export const BACKGROUND_PATTERNS: {
  id: NonNullable<EInvite['backgroundTheme']>;
  name: string;
  css: (color: string) => string;
}[] = [
  {
    id: 'damask',
    name: 'Ornate Damask Arches',
    css: (color) =>
      `radial-gradient(circle at 50% 50%, ${color}0D 10%, transparent 11%), radial-gradient(circle at 0% 0%, ${color}0D 10%, transparent 11%), radial-gradient(circle at 100% 100%, ${color}0D 10%, transparent 11%)`,
  },
  {
    id: 'mandala',
    name: 'Sacred Mandala Watermark',
    css: (color) =>
      `radial-gradient(circle at center, ${color}12 0%, ${color}06 35%, transparent 70%)`,
  },
  {
    id: 'floral',
    name: 'Mughal Trellis Vine',
    css: (color) =>
      `repeating-linear-gradient(45deg, ${color}08 0px, ${color}08 2px, transparent 2px, transparent 16px), repeating-linear-gradient(-45deg, ${color}08 0px, ${color}08 2px, transparent 2px, transparent 16px)`,
  },
  {
    id: 'imperial_gradient',
    name: 'Imperial Radial Aura',
    css: (color) =>
      `radial-gradient(circle at top right, ${color}18, transparent 65%), radial-gradient(circle at bottom left, ${color}15, transparent 65%)`,
  },
  {
    id: 'clean_linen',
    name: 'Clean Linen Minimal',
    css: (color) =>
      `repeating-linear-gradient(0deg, ${color}05, ${color}05 1px, transparent 1px, transparent 8px)`,
  },
  {
    id: 'none',
    name: 'Solid Pure Canvas',
    css: () => 'none',
  },
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
  const parties = useLiveQuery(
    () => db.guestParties.where('weddingId').equals(wedding.id).toArray(),
    [wedding.id]
  );

  const [activeInviteId, setActiveInviteId] = useState<string>('');
  const activeInvite = invites?.find((inv) => inv.id === activeInviteId) || invites?.[0];

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvite, setEditingInvite] = useState<EInvite | null>(null);

  // Form states
  const [title, setTitle] = useState('All Functions Itinerary');
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
  const [themeCardBg, setThemeCardBg] = useState('#FFFFFF');
  const [themeText, setThemeText] = useState('#271E1D');
  const [themeBorderColor, setThemeBorderColor] = useState('#D97706');
  const [backgroundTheme, setBackgroundTheme] = useState<
    NonNullable<EInvite['backgroundTheme']>
  >('damask');

  // Card reference for PNG capture
  const cardRef = useRef<HTMLDivElement>(null);

  const brideTerm = wedding.brideSideTerm || "Bride's Side (Ladkiwale)";
  const groomTerm = wedding.groomSideTerm || "Groom's Side (Ladkewale)";

  // Auto-filter events based on invite type
  const handleInviteTypeSelect = (newType: EInvite['inviteType']) => {
    setInviteType(newType);
    if (!events) return;

    const allowedTypes = INVITE_TYPE_CONFIG[newType].defaultEventTypes;
    const matchingEventIds = events
      .filter((ev) => allowedTypes.includes(ev.type))
      .map((ev) => ev.id);

    setSelectedEventIds(matchingEventIds.length > 0 ? matchingEventIds : events.map((e) => e.id));

    // Update title suggestion
    if (!editingInvite) {
      if (newType === 'whole_wedding') setTitle('Whole Wedding Celebrations');
      else if (newType === 'ceremony_only') setTitle('Wedding Ceremony & Muhurat');
      else if (newType === 'initial_events') setTitle('Pre-Wedding Celebrations (Mehendi & Sangeet)');
      else if (newType === 'party_only') setTitle('Cocktail & Grand Reception');
    }
  };

  const applyColorPalette = (palette: (typeof COLOR_PALETTES)[0]) => {
    setThemePrimary(palette.primary);
    setThemeSecondary(palette.secondary);
    setThemeBackground(palette.background);
    setThemeCardBg(palette.cardBg);
    setThemeText(palette.text);
    setThemeBorderColor(palette.borderColor);
    setUseCustomTheme(true);
  };

  const openAddInvite = () => {
    setEditingInvite(null);
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

    // Reset color theme to default Rajputana
    const defaultPal = COLOR_PALETTES[0];
    setUseCustomTheme(false);
    setThemePrimary(defaultPal.primary);
    setThemeSecondary(defaultPal.secondary);
    setThemeBackground(defaultPal.background);
    setThemeCardBg(defaultPal.cardBg);
    setThemeText(defaultPal.text);
    setThemeBorderColor(defaultPal.borderColor);
    setBackgroundTheme('damask');

    setIsModalOpen(true);
  };

  const openEditInvite = (inv: EInvite) => {
    setEditingInvite(inv);
    setTitle(inv.title);
    setSlug(inv.slug);
    setInviteType(inv.inviteType || 'whole_wedding');
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
    setCoverGreeting(inv.coverGreeting);
    setHostFamilyNames(inv.hostFamilyNames);
    setCustomMessage(inv.customMessage);
    setRsvpPhone(inv.rsvpPhone || '');
    setGoogleMapsUrl(inv.googleMapsUrl || '');

    if (inv.themeColors) {
      setUseCustomTheme(true);
      setThemePrimary(inv.themeColors.primary);
      setThemeSecondary(inv.themeColors.secondary);
      setThemeBackground(inv.themeColors.background);
      setThemeCardBg(inv.themeColors.cardBg || '#FFFFFF');
      setThemeText(inv.themeColors.text);
      setThemeBorderColor(inv.themeColors.borderColor || inv.themeColors.secondary);
    } else {
      setUseCustomTheme(false);
      const defaultPal = COLOR_PALETTES[0];
      setThemePrimary(defaultPal.primary);
      setThemeSecondary(defaultPal.secondary);
      setThemeBackground(defaultPal.background);
      setThemeCardBg(defaultPal.cardBg);
      setThemeText(defaultPal.text);
      setThemeBorderColor(defaultPal.borderColor);
    }

    setBackgroundTheme(inv.backgroundTheme || 'damask');
    setIsModalOpen(true);
  };

  const handleSaveInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    const inviteRecord: EInvite = {
      id: editingInvite ? editingInvite.id : `inv-${wedding.id}-${Date.now()}`,
      weddingId: wedding.id,
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      inviteType,
      templateStyle:
        templateId === 'royal_palace'
          ? 'palace_arch'
          : templateId === 'mughal_floral'
          ? 'floral_mughal'
          : templateId === 'contemporary_ivory'
          ? 'modern_minimal'
          : 'royal_mandala',
      templateId,
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
          }
        : undefined,
      backgroundTheme,
      rsvpPhone: rsvpPhone.trim() || undefined,
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      createdAt: editingInvite ? editingInvite.createdAt : Date.now(),
    };

    await db.eInvites.put(inviteRecord);
    setActiveInviteId(inviteRecord.id);
    setIsModalOpen(false);
  };

  const handleDeleteInvite = async (id: string) => {
    if (confirm('Delete this e-invite variant?')) {
      await db.eInvites.delete(id);
    }
  };

  // Download High-Res PNG
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${wedding.brideName}-${wedding.groomName}-${activeInvite?.slug || 'invite'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Failed to generate PNG image.');
    }
  };

  // Export Standalone Interactive HTML package
  const handleExportHtml = () => {
    if (!activeInvite) return;

    const currentTemplate =
      activeInvite.templateId ||
      (activeInvite.templateStyle === 'floral_mughal'
        ? 'mughal_floral'
        : activeInvite.templateStyle === 'palace_arch'
        ? 'royal_palace'
        : activeInvite.templateStyle === 'modern_minimal'
        ? 'contemporary_ivory'
        : 'regal_mandala');

    const defaultTmpl = TEMPLATE_CONFIG[currentTemplate];
    const colors = {
      primary: activeInvite.themeColors?.primary || defaultTmpl.primaryText,
      secondary: activeInvite.themeColors?.secondary || defaultTmpl.accentColor,
      background: activeInvite.themeColors?.background || defaultTmpl.cardBg,
      cardBg: activeInvite.themeColors?.cardBg || '#FFFFFF',
      text: activeInvite.themeColors?.text || '#271E1D',
      borderColor: activeInvite.themeColors?.borderColor || defaultTmpl.borderColor,
    };

    const patternObj = BACKGROUND_PATTERNS.find(
      (p) => p.id === (activeInvite.backgroundTheme || 'damask')
    ) || BACKGROUND_PATTERNS[0];
    const patternCss = patternObj.css(colors.secondary);

    const includedEvents = events?.filter((ev) => activeInvite.includedEventIds.includes(ev.id)) || [];

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
  <title>${wedding.brideName} & ${wedding.groomName} — ${activeInvite.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 24px 12px;
      font-family: 'Inter', sans-serif;
      background-color: ${colors.background};
      background-image: ${patternCss};
      color: ${colors.text};
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      max-width: 540px;
      width: 100%;
      background: ${colors.cardBg};
      border: 3px solid ${colors.borderColor};
      border-radius: 28px;
      padding: 36px 24px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.12);
      position: relative;
      box-sizing: border-box;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
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
    <div class="greeting">${activeInvite.coverGreeting}</div>
    <h1>${wedding.brideName} &amp; ${wedding.groomName}</h1>
    <div class="families">${activeInvite.hostFamilyNames}</div>
    <div class="message">"${activeInvite.customMessage}"</div>
    <div class="events">${eventsHtml}</div>
    <div style="margin-top: 24px; font-size: 13px; color: #555;">
      <strong>Venue:</strong> ${wedding.venue}, ${wedding.city}<br>
      ${activeInvite.rsvpPhone ? `<strong>RSVP:</strong> ${activeInvite.rsvpPhone}` : ''}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${wedding.brideName}-${wedding.groomName}-${activeInvite.slug}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // WhatsApp Invite Text Generator
  const handleCopyWhatsApp = () => {
    if (!activeInvite) return;

    const includedEvents = events?.filter((ev) => activeInvite.includedEventIds.includes(ev.id)) || [];

    let msg = `🌸 *WEDDING INVITATION* 🌸\n\n`;
    msg += `*${activeInvite.coverGreeting}*\n\n`;
    msg += `✨ *${wedding.brideName} & ${wedding.groomName}* ✨\n`;
    msg += `(${activeInvite.hostFamilyNames})\n\n`;
    msg += `"${activeInvite.customMessage}"\n\n`;
    msg += `🗓️ *CELEBRATIONS & ITINERARY:*\n`;

    for (const ev of includedEvents) {
      msg += `\n📍 *${ev.name}*\n`;
      msg += `• Date: ${ev.date} (${ev.startTime} - ${ev.endTime})\n`;
      msg += `• Venue: ${ev.venue}\n`;
      if (ev.dressCode) msg += `• Dress Code: ${ev.dressCode}\n`;
    }

    msg += `\n🏛️ *Primary Venue:* ${wedding.venue}, ${wedding.city}\n`;
    if (activeInvite.googleMapsUrl) msg += `🗺️ *Location Map:* ${activeInvite.googleMapsUrl}\n`;
    if (activeInvite.rsvpPhone) msg += `📞 *RSVP Contact:* ${activeInvite.rsvpPhone}\n`;

    navigator.clipboard.writeText(msg);
    alert('Invitation formatted text copied to clipboard! Ready to paste into WhatsApp.');
  };

  // Active Template Config & Theme Customization Resolution
  const currentTemplateId: 'royal_palace' | 'mughal_floral' | 'regal_mandala' | 'contemporary_ivory' =
    activeInvite?.templateId ||
    (activeInvite?.templateStyle === 'floral_mughal'
      ? 'mughal_floral'
      : activeInvite?.templateStyle === 'palace_arch'
      ? 'royal_palace'
      : activeInvite?.templateStyle === 'modern_minimal'
      ? 'contemporary_ivory'
      : 'regal_mandala');

  const baseTemplateConfig = TEMPLATE_CONFIG[currentTemplateId] || TEMPLATE_CONFIG.royal_palace;
  const activeTypeConfig = INVITE_TYPE_CONFIG[activeInvite?.inviteType || 'whole_wedding'];

  // Effective colors taking custom themeColors into account
  const effectiveTheme = {
    primaryText: activeInvite?.themeColors?.primary || baseTemplateConfig.primaryText,
    accentColor: activeInvite?.themeColors?.secondary || baseTemplateConfig.accentColor,
    borderColor: activeInvite?.themeColors?.borderColor || baseTemplateConfig.borderColor,
    cardBg: activeInvite?.themeColors?.cardBg || baseTemplateConfig.cardBg,
    background: activeInvite?.themeColors?.background || '#F8FAFC',
    text: activeInvite?.themeColors?.text || '#271E1D',
  };

  const currentPattern = BACKGROUND_PATTERNS.find(
    (p) => p.id === (activeInvite?.backgroundTheme || 'damask')
  ) || BACKGROUND_PATTERNS[0];
  const activePatternCss = currentPattern.css(effectiveTheme.accentColor);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Controls */}
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
              Pillar 7: 4 invite types &times; 4 royal design templates, pre-defined cultural palettes, custom color pickers & background themes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportHtml}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
              title="Export standalone HTML bundle"
            >
              <FileCode className="w-3.5 h-3.5 text-theme-primary" />
              <span>Export HTML</span>
            </button>

            <button
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
              title="Download card as PNG image"
            >
              <ImageIcon className="w-3.5 h-3.5 text-theme-secondary" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Copy WhatsApp</span>
            </button>

            <button
              onClick={openAddInvite}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New E-Invite Variant</span>
            </button>
          </div>
        </div>
      </div>

      {/* EMBEDDED INVITE LIST & LIVE DESIGNER SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (4 Cols): EMBEDDED INVITE LIST */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
              <div>
                <h3 className="font-serif font-bold text-sm text-theme-text-main flex items-center gap-2">
                  <Mail className="w-4 h-4 text-theme-primary" />
                  <span>All E-Invites ({invites?.length || 0})</span>
                </h3>
                <p className="text-[11px] text-theme-text-muted mt-0.5">
                  Click any invite to view preview & details.
                </p>
              </div>

              <button
                onClick={openAddInvite}
                className="p-1.5 rounded-xl bg-theme-primary text-white hover:bg-theme-primary-hover transition-colors"
                title="Create another invite combination"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of E-Invites */}
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {invites?.map((inv) => {
                const isSelected = activeInvite?.id === inv.id;
                const typeCfg = INVITE_TYPE_CONFIG[inv.inviteType || 'whole_wedding'];
                const tmplId =
                  inv.templateId ||
                  (inv.templateStyle === 'floral_mughal'
                    ? 'mughal_floral'
                    : inv.templateStyle === 'palace_arch'
                    ? 'royal_palace'
                    : inv.templateStyle === 'modern_minimal'
                    ? 'contemporary_ivory'
                    : 'regal_mandala');
                const tmplCfg = TEMPLATE_CONFIG[tmplId] || TEMPLATE_CONFIG.royal_palace;
                const TmplIcon = tmplCfg.icon;

                return (
                  <div
                    key={inv.id}
                    onClick={() => setActiveInviteId(inv.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 relative group ${
                      isSelected
                        ? 'border-theme-primary bg-theme-background/90 shadow-md ring-1 ring-theme-primary/20'
                        : 'border-theme-border bg-theme-card hover:border-theme-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
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

                        <h4 className="font-serif font-bold text-sm text-theme-text-main leading-snug">
                          {inv.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 text-theme-text-muted opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditInvite(inv);
                          }}
                          className="p-1 rounded-md hover:text-theme-primary hover:bg-theme-background"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInvite(inv.id);
                          }}
                          className="p-1 rounded-md hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-theme-text-muted border-t border-theme-border/60 pt-2">
                      <span>{inv.includedEventIds?.length || 0} Ceremonies Included</span>
                      <span className="font-mono text-[10px] text-theme-primary">
                        /{inv.slug}
                      </span>
                    </div>
                  </div>
                );
              })}

              {(!invites || invites.length === 0) && (
                <div className="text-center py-8 text-theme-text-muted text-xs italic">
                  No invite variants created yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER & RIGHT (8 Cols): LIVE INVITATION CARD PREVIEW */}
        {activeInvite ? (
          <div className="lg:col-span-8 flex flex-col items-center space-y-4">
            {/* Template & Type Ribbon */}
            <div className="w-full max-w-xl flex items-center justify-between text-xs bg-theme-card border border-theme-border px-4 py-2.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-theme-text-main">{activeInvite.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${activeTypeConfig.badgeColor}`}
                >
                  {activeTypeConfig.label}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-theme-secondary">
                Template: {baseTemplateConfig.name}
              </span>
            </div>

            {/* Live Visual Invitation Card Container */}
            <div
              className="w-full max-w-xl p-4 sm:p-6 rounded-3xl border border-theme-border shadow-md"
              style={{
                backgroundColor: effectiveTheme.background,
                backgroundImage: activePatternCss,
              }}
            >
              <div
                ref={cardRef}
                className="w-full rounded-2xl p-6 sm:p-9 shadow-2xl text-center space-y-6 relative overflow-hidden transition-all border-4"
                style={{
                  backgroundColor: effectiveTheme.cardBg,
                  borderColor: effectiveTheme.borderColor,
                  minHeight: '640px',
                }}
              >
                {/* Corner Ornaments */}
                <div
                  className="absolute top-2.5 left-2.5 w-8 h-8 border-t-2 border-l-2"
                  style={{ borderColor: effectiveTheme.borderColor }}
                />
                <div
                  className="absolute top-2.5 right-2.5 w-8 h-8 border-t-2 border-r-2"
                  style={{ borderColor: effectiveTheme.borderColor }}
                />
                <div
                  className="absolute bottom-2.5 left-2.5 w-8 h-8 border-b-2 border-l-2"
                  style={{ borderColor: effectiveTheme.borderColor }}
                />
                <div
                  className="absolute bottom-2.5 right-2.5 w-8 h-8 border-b-2 border-r-2"
                  style={{ borderColor: effectiveTheme.borderColor }}
                />

                {/* Decorative Arch / Emblem */}
                <div
                  className="w-14 h-14 mx-auto rounded-full border flex items-center justify-center shadow-xs"
                  style={{
                    borderColor: effectiveTheme.borderColor,
                    backgroundColor: `${effectiveTheme.borderColor}15`,
                  }}
                >
                  {currentTemplateId === 'royal_palace' && (
                    <Crown className="w-7 h-7" style={{ color: effectiveTheme.borderColor }} />
                  )}
                  {currentTemplateId === 'mughal_floral' && (
                    <Flower2 className="w-7 h-7" style={{ color: effectiveTheme.borderColor }} />
                  )}
                  {currentTemplateId === 'regal_mandala' && (
                    <Compass className="w-7 h-7" style={{ color: effectiveTheme.borderColor }} />
                  )}
                  {currentTemplateId === 'contemporary_ivory' && (
                    <Sparkles className="w-7 h-7" style={{ color: effectiveTheme.borderColor }} />
                  )}
                </div>

                {/* Greeting */}
                <div className="space-y-1">
                  <span
                    className="text-[11px] uppercase tracking-widest font-bold block"
                    style={{ color: effectiveTheme.accentColor }}
                  >
                    {activeInvite.coverGreeting}
                  </span>
                  <h1
                    className="font-serif font-bold text-3xl sm:text-4xl tracking-tight"
                    style={{ color: effectiveTheme.primaryText }}
                  >
                    {wedding.brideName} & {wedding.groomName}
                  </h1>
                  <p className="text-xs text-stone-600 font-medium">
                    {activeInvite.hostFamilyNames}
                  </p>
                </div>

                {/* Custom Inviting Message */}
                <p
                  className="text-xs sm:text-sm text-stone-700 italic max-w-md mx-auto leading-relaxed py-3 border-y"
                  style={{ borderColor: `${effectiveTheme.borderColor}40` }}
                >
                  "{activeInvite.customMessage}"
                </p>

                {/* Selected Events Schedule */}
                <div className="space-y-3 pt-2">
                  <h3
                    className="font-serif font-bold text-xs uppercase tracking-wider"
                    style={{ color: effectiveTheme.primaryText }}
                  >
                    Celebrations Schedule ({activeTypeConfig.label})
                  </h3>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {events
                      ?.filter((ev) => activeInvite.includedEventIds.includes(ev.id))
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="bg-white/85 border rounded-2xl p-3 text-left shadow-2xs space-y-1"
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
                          <div className="text-[11px] text-stone-600 flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-amber-600" />
                            <span>{ev.date}</span>
                            <span>&bull;</span>
                            <span className="truncate">{ev.venue}</span>
                          </div>
                          {ev.dressCode && (
                            <div
                              className="text-[10px] italic font-medium"
                              style={{ color: effectiveTheme.accentColor }}
                            >
                              Dress Code: {ev.dressCode}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Footer Details */}
                <div
                  className="pt-3 border-t space-y-2"
                  style={{ borderColor: `${effectiveTheme.borderColor}40` }}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-800">
                    <MapPin className="w-3.5 h-3.5 text-rose-700" />
                    <span>
                      {wedding.venue}, {wedding.city}
                    </span>
                  </div>
                  {activeInvite.rsvpPhone && (
                    <div className="text-[11px] text-stone-600">
                      RSVP:{' '}
                      <strong className="text-stone-900">{activeInvite.rsvpPhone}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-theme-card border-2 border-dashed border-theme-border rounded-3xl p-12 text-center space-y-3">
            <Mail className="w-10 h-10 text-theme-text-muted mx-auto" />
            <h3 className="font-serif font-bold text-base text-theme-text-main">
              No E-Invite Selected
            </h3>
            <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
              Choose from 4 invite types and 4 templates to generate customized e-invites.
            </p>
            <button
              onClick={openAddInvite}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow hover:bg-theme-primary-hover"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First E-Invite</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                {editingInvite ? 'Edit E-Invite Variant' : 'Create New E-Invite Combination'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvite} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* STEP 1: INVITE TYPE (4 Options) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-theme-primary" />
                  <span>1. Select Invitation Type (Cohort Audience)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    Object.keys(INVITE_TYPE_CONFIG) as Array<EInvite['inviteType']>
                  ).map((typeKey) => {
                    const cfg = INVITE_TYPE_CONFIG[typeKey];
                    const isSelected = inviteType === typeKey;

                    return (
                      <button
                        type="button"
                        key={typeKey}
                        onClick={() => handleInviteTypeSelect(typeKey)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-theme-primary bg-theme-primary-light/40 shadow-xs'
                            : 'border-theme-border bg-theme-card hover:bg-theme-border/20'
                        }`}
                      >
                        <div className="font-bold text-xs text-theme-text-main">{cfg.label}</div>
                        <div className="text-[10px] text-theme-text-muted mt-0.5">
                          {cfg.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: DESIGN TEMPLATE (4 Options) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-theme-secondary" />
                  <span>2. Select Visual Design Template (4 Aesthetic Styles)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    Object.keys(TEMPLATE_CONFIG) as Array<
                      'royal_palace' | 'mughal_floral' | 'regal_mandala' | 'contemporary_ivory'
                    >
                  ).map((tmplKey) => {
                    const cfg = TEMPLATE_CONFIG[tmplKey];
                    const isSelected = templateId === tmplKey;
                    const TmplIcon = cfg.icon;

                    return (
                      <button
                        type="button"
                        key={tmplKey}
                        onClick={() => {
                          setTemplateId(tmplKey);
                          if (!useCustomTheme) {
                            // Align defaults
                            setThemePrimary(cfg.primaryText);
                            setThemeSecondary(cfg.accentColor);
                            setThemeBorderColor(cfg.borderColor);
                            setThemeCardBg(cfg.cardBg);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-theme-primary bg-theme-primary-light/40 shadow-xs'
                            : 'border-theme-border bg-theme-card hover:bg-theme-border/20'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-theme-text-main">
                          <TmplIcon className="w-3.5 h-3.5" style={{ color: cfg.accentColor }} />
                          <span>{cfg.name}</span>
                        </div>
                        <div className="text-[10px] text-theme-text-muted mt-0.5 line-clamp-2">
                          {cfg.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: COLOR THEME & PALETTES */}
              <div className="space-y-3 p-3.5 rounded-2xl border border-theme-border bg-theme-background/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-theme-primary" />
                    <span>3. Color Theme (Pre-defined Palettes or Custom Pickers)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomTheme}
                      onChange={(e) => setUseCustomTheme(e.target.checked)}
                      className="rounded text-theme-primary focus:ring-theme-primary"
                    />
                    <span className="text-theme-text-muted text-[11px]">Enable Custom Colors</span>
                  </label>
                </div>

                {/* Pre-defined Cultural Palettes */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider block">
                    Quick Cultural Palettes
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COLOR_PALETTES.map((pal) => (
                      <button
                        type="button"
                        key={pal.id}
                        onClick={() => applyColorPalette(pal)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          useCustomTheme && themePrimary === pal.primary
                            ? 'border-theme-primary bg-theme-card shadow-xs ring-1 ring-theme-primary/30'
                            : 'border-theme-border bg-theme-card/60 hover:bg-theme-card'
                        }`}
                      >
                        <div className="flex -space-x-1 shrink-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: pal.primary }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: pal.secondary }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: pal.borderColor }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-theme-text-main truncate">
                          {pal.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular Color Pickers (Visible when custom theme enabled) */}
                {useCustomTheme && (
                  <div className="pt-2 border-t border-theme-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-theme-text-muted block">
                        Primary (Names/Headings)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themePrimary}
                          onChange={(e) => setThemePrimary(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
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
                        Accent / Secondary
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSecondary}
                          onChange={(e) => setThemeSecondary(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
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
                        Outer Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeBackground}
                          onChange={(e) => setThemeBackground(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
                        />
                        <input
                          type="text"
                          value={themeBackground}
                          onChange={(e) => setThemeBackground(e.target.value)}
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
                          className="w-8 h-8 rounded-lg border border-theme-border cursor-pointer p-0.5 bg-theme-card"
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

              {/* STEP 4: BACKGROUND PATTERN THEME */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-theme-text-main flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>4. Background Watermark Pattern</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BACKGROUND_PATTERNS.map((pat) => (
                    <button
                      type="button"
                      key={pat.id}
                      onClick={() => setBackgroundTheme(pat.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        backgroundTheme === pat.id
                          ? 'border-theme-primary bg-theme-primary-light/40 font-bold text-theme-text-main shadow-xs'
                          : 'border-theme-border bg-theme-card hover:bg-theme-border/20 text-theme-text-muted'
                      }`}
                    >
                      {pat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Title / Label *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Whole Wedding Celebrations"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
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
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Opening Greeting</label>
                  <input
                    type="text"
                    value={coverGreeting}
                    onChange={(e) => setCoverGreeting(e.target.value)}
                    placeholder="e.g. Together with their families"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Host Families</label>
                  <input
                    type="text"
                    value={hostFamilyNames}
                    onChange={(e) => setHostFamilyNames(e.target.value)}
                    placeholder={`${brideTerm} & ${groomTerm}`}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Custom Invitation Message</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Request the honor of your presence..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Ceremony Inclusion Checkboxes */}
              <div className="space-y-1.5 border-t border-theme-border/60 pt-3">
                <label className="text-xs font-bold text-theme-text-main block">
                  Included Ceremonies & Events
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {events?.map((ev) => {
                    const isChecked = selectedEventIds.includes(ev.id);
                    return (
                      <label
                        key={ev.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-theme-primary bg-theme-primary-light/40 font-bold'
                            : 'border-theme-border bg-theme-background text-theme-text-muted'
                        }`}
                      >
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
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">RSVP Contact Number</label>
                  <input
                    type="tel"
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Google Maps Link</label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-theme-text-main text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-theme-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card text-xs font-semibold text-theme-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold shadow hover:bg-theme-primary-hover"
                >
                  {editingInvite ? 'Save Changes' : 'Create E-Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
