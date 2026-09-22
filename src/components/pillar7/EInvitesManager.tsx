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
} from 'lucide-react';

interface EInvitesManagerProps {
  wedding: Wedding;
  onOpenTagManager?: () => void;
}

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
  const [templateStyle, setTemplateStyle] = useState<EInvite['templateStyle']>('royal_mandala');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [coverGreeting, setCoverGreeting] = useState('Together with their families');
  const [hostFamilyNames, setHostFamilyNames] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Card reference for PNG capture
  const cardRef = useRef<HTMLDivElement>(null);

  const openAddInvite = () => {
    setEditingInvite(null);
    setTitle('Full Wedding Celebrations');
    setSlug(`invite-${Date.now().toString().slice(-4)}`);
    setTemplateStyle('royal_mandala');
    setSelectedEventIds(events?.map((e) => e.id) || []);
    setCoverGreeting('Together with their families');
    setHostFamilyNames(`${wedding.brideSideName} & ${wedding.groomSideName}`);
    setCustomMessage(
      `Request the pleasure of your company as ${wedding.brideName} & ${wedding.groomName} tie the sacred knot.`
    );
    setRsvpPhone('+91 98000 00000');
    setGoogleMapsUrl(`https://maps.google.com/?q=${encodeURIComponent(wedding.venue + ' ' + wedding.city)}`);
    setIsModalOpen(true);
  };

  const openEditInvite = (inv: EInvite) => {
    setEditingInvite(inv);
    setTitle(inv.title);
    setSlug(inv.slug);
    setTemplateStyle(inv.templateStyle);
    setSelectedEventIds(inv.includedEventIds || []);
    setCoverGreeting(inv.coverGreeting);
    setHostFamilyNames(inv.hostFamilyNames);
    setCustomMessage(inv.customMessage);
    setRsvpPhone(inv.rsvpPhone || '');
    setGoogleMapsUrl(inv.googleMapsUrl || '');
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
      templateStyle,
      includedEventIds: selectedEventIds,
      coverGreeting: coverGreeting.trim(),
      hostFamilyNames: hostFamilyNames.trim(),
      customMessage: customMessage.trim(),
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
      link.download = `${wedding.brideName}-${wedding.groomName}-invite.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Failed to generate PNG image.');
    }
  };

  // Export Standalone Interactive HTML package
  const handleExportHtml = () => {
    if (!activeInvite) return;

    const includedEvents = events?.filter((ev) => activeInvite.includedEventIds.includes(ev.id)) || [];

    const eventsHtml = includedEvents
      .map(
        (ev) => `
        <div style="background: rgba(255,255,255,0.85); border: 1px solid #E8DFD8; border-radius: 16px; padding: 16px; margin-bottom: 12px; text-align: left;">
          <div style="font-weight: 700; color: #7B1113; font-size: 16px;">${ev.name}</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">${ev.date} &bull; ${ev.startTime} to ${ev.endTime}</div>
          <div style="font-size: 13px; color: #333; margin-top: 4px;"><strong>Venue:</strong> ${ev.venue}</div>
          ${ev.dressCode ? `<div style="font-size: 12px; color: #D97706; margin-top: 4px;"><strong>Dress Code:</strong> ${ev.dressCode}</div>` : ''}
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
  <title>${wedding.brideName} & ${wedding.groomName} — Wedding Invitation</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 24px 12px;
      font-family: 'Inter', sans-serif;
      background: #FCFBF7;
      color: #271E1D;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      max-width: 540px;
      width: 100%;
      background: #FFFFFF;
      border: 3px solid #D97706;
      border-radius: 28px;
      padding: 36px 24px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(123, 17, 19, 0.12);
      position: relative;
      box-sizing: border-box;
    }
    .arch {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      color: #D97706;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #7B1113;
      margin: 12px 0 6px;
    }
    .greeting {
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #D97706;
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
      line-height: 1.6;
      margin-bottom: 24px;
      font-style: italic;
    }
    .btn {
      display: inline-block;
      background: #7B1113;
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      padding: 12px 24px;
      border-radius: 12px;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="greeting">${activeInvite.coverGreeting}</div>
    <h1>${wedding.brideName} & ${wedding.groomName}</h1>
    <div class="families">${activeInvite.hostFamilyNames}</div>
    <p class="message">"${activeInvite.customMessage}"</p>
    
    <div style="margin: 28px 0 16px;">
      <div style="font-family: 'Playfair Display', serif; font-size: 20px; color: #7B1113; font-weight: 700; margin-bottom: 12px;">Wedding Ceremonies Itinerary</div>
      ${eventsHtml}
    </div>

    ${
      activeInvite.googleMapsUrl
        ? `<a href="${activeInvite.googleMapsUrl}" target="_blank" class="btn">View Venue Directions on Map</a>`
        : ''
    }

    ${activeInvite.rsvpPhone ? `<div style="font-size: 12px; color: #666; margin-top: 20px;">RSVP Contact: <strong>${activeInvite.rsvpPhone}</strong></div>` : ''}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeInvite.slug}-e-invite.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // WhatsApp 1-Click Link Generator
  const handleCopyWhatsApp = (guestName = 'Honored Guest') => {
    if (!activeInvite) return;

    const text = `Namaste ${guestName}! 🙏\n\n${activeInvite.coverGreeting},\n*${activeInvite.hostFamilyNames}*\n\ncordially invite you to celebrate the wedding of:\n✨ *${wedding.brideName} & ${wedding.groomName}* ✨\n\n📍 *Venue:* ${wedding.venue}, ${wedding.city}\n📅 *Dates:* ${wedding.startDate} to ${wedding.endDate}\n\n"${activeInvite.customMessage}"\n\nLooking forward to celebrating with you!\nRSVP: ${activeInvite.rsvpPhone || ''}`;

    navigator.clipboard.writeText(text);
    alert('WhatsApp message template copied to clipboard!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Controls */}
      <div className="bg-theme-card border border-theme-border p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-theme-primary" />
              <h2 className="text-xl font-bold font-serif text-theme-text-main">
                Festive E-Invites & Multi-Cohort Exporter
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted mt-1">
              Pillar 7: Design personalized invitations, download PNG graphics, export standalone HTML packages, and share via WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportHtml}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
              title="Export self-contained HTML bundle"
            >
              <FileCode className="w-3.5 h-3.5 text-theme-primary" />
              <span>Export Standalone HTML</span>
            </button>

            <button
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main transition-colors"
              title="Download card as PNG image"
            >
              <ImageIcon className="w-3.5 h-3.5 text-theme-secondary" />
              <span>Download PNG Card</span>
            </button>

            <button
              onClick={() => handleCopyWhatsApp()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Copy WhatsApp Invite</span>
            </button>

            <button
              onClick={openAddInvite}
              className="inline-flex items-center gap-1.5 bg-theme-primary text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow hover:bg-theme-primary-hover active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Invite Cohort</span>
            </button>
          </div>
        </div>

        {/* Cohort Tabs */}
        {invites && invites.length > 0 && (
          <div className="border-t border-theme-border/60 pt-3 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold uppercase text-theme-text-muted">Cohorts:</span>
            {invites.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setActiveInviteId(inv.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeInvite?.id === inv.id
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'bg-theme-background text-theme-text-muted hover:bg-theme-border/30'
                }`}
              >
                {inv.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main E-Invite Designer & Preview Canvas */}
      {activeInvite ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Live Visual Invitation Card (2 Cols) */}
          <div className="lg:col-span-2 flex justify-center">
            <div
              ref={cardRef}
              className="w-full max-w-lg bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7EFE4] border-4 border-[#D97706] rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden"
              style={{ minHeight: '640px' }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#D97706]" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#D97706]" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#D97706]" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#D97706]" />

              {/* Decorative Arch Emblem */}
              <div className="w-12 h-12 mx-auto rounded-full bg-[#7B1113]/10 border border-[#D97706] flex items-center justify-center text-[#7B1113]">
                <Sparkles className="w-6 h-6 text-[#D97706]" />
              </div>

              {/* Greeting */}
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-widest font-bold text-[#D97706]">
                  {activeInvite.coverGreeting}
                </span>
                <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#7B1113] tracking-tight">
                  {wedding.brideName} & {wedding.groomName}
                </h1>
                <p className="text-xs text-stone-600 font-medium">
                  {activeInvite.hostFamilyNames}
                </p>
              </div>

              {/* Custom Inviting Message */}
              <p className="text-xs sm:text-sm text-stone-700 italic max-w-md mx-auto leading-relaxed border-y border-[#D97706]/30 py-3">
                "{activeInvite.customMessage}"
              </p>

              {/* Selected Events Schedule */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#7B1113]">
                  Celebrations Schedule
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {events
                    ?.filter((ev) => activeInvite.includedEventIds.includes(ev.id))
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-white/80 border border-[#E8DFD8] rounded-2xl p-3 text-left shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#7B1113]">{ev.name}</span>
                          <span className="text-[10px] text-stone-500 font-medium">
                            {ev.startTime} - {ev.endTime}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-600 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-[#D97706]" />
                          <span>{ev.date}</span>
                          <span>&bull;</span>
                          <span className="truncate">{ev.venue}</span>
                        </div>
                        {ev.dressCode && (
                          <div className="text-[10px] text-[#D97706] italic">
                            Dress Code: {ev.dressCode}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Footer Details */}
              <div className="pt-2 border-t border-[#D97706]/30 space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-[#7B1113]" />
                  <span>{wedding.venue}, {wedding.city}</span>
                </div>
                {activeInvite.rsvpPhone && (
                  <div className="text-[11px] text-stone-500">
                    RSVP: <strong className="text-stone-800">{activeInvite.rsvpPhone}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Cohort Settings & Actions (1 Col) */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-theme-text-main">
                  Cohort Details
                </h3>
                <p className="text-xs text-theme-text-muted">Slug: #{activeInvite.slug}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditInvite(activeInvite)}
                  className="p-1.5 text-theme-text-muted hover:text-theme-primary rounded-lg transition-colors"
                  title="Edit details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteInvite(activeInvite.id)}
                  className="p-1.5 text-theme-text-muted hover:text-rose-600 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-theme-background p-3 rounded-2xl border border-theme-border space-y-1">
                <div className="text-[10px] uppercase font-bold text-theme-text-muted">Included Functions</div>
                <div className="font-semibold text-theme-text-main">
                  {activeInvite.includedEventIds.length} ceremonies included
                </div>
              </div>

              <div className="bg-theme-background p-3 rounded-2xl border border-theme-border space-y-1">
                <div className="text-[10px] uppercase font-bold text-theme-text-muted">Direct Share Link</div>
                <div className="font-mono text-[11px] text-theme-primary truncate">
                  vivahplanner.app/#/invite/{activeInvite.slug}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleExportHtml}
                  className="w-full py-2.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main flex items-center justify-center gap-2 transition-colors"
                >
                  <FileCode className="w-4 h-4 text-theme-primary" />
                  <span>Download Standalone HTML</span>
                </button>

                <button
                  onClick={handleDownloadPng}
                  className="w-full py-2.5 rounded-xl border border-theme-border bg-theme-background hover:bg-theme-border/30 text-xs font-semibold text-theme-text-main flex items-center justify-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-theme-secondary" />
                  <span>Download High-Res PNG</span>
                </button>

                <button
                  onClick={() => handleCopyWhatsApp()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Copy WhatsApp Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-theme-card border-2 border-dashed border-theme-border rounded-3xl p-12 text-center space-y-3">
          <Mail className="w-10 h-10 text-theme-text-muted mx-auto" />
          <h4 className="font-serif font-bold text-base text-theme-text-main">No E-Invites Created</h4>
          <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
            Create multi-cohort e-invites tailored to all guests, VIP families, or reception-only attendees.
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

      {/* Add / Edit E-Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-theme-card border border-theme-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-theme-border bg-theme-background/60 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-theme-text-main">
                {editingInvite ? 'Edit E-Invite Cohort' : 'Create E-Invite Cohort'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-theme-text-muted hover:text-theme-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvite} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Cohort Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. All Functions Itinerary"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">URL Slug *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. jaipur-vivah"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Greeting Header</label>
                <input
                  type="text"
                  value={coverGreeting}
                  onChange={(e) => setCoverGreeting(e.target.value)}
                  placeholder="e.g. Together with their families"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Host Family Names</label>
                <input
                  type="text"
                  value={hostFamilyNames}
                  onChange={(e) => setHostFamilyNames(e.target.value)}
                  placeholder="e.g. The Sharma & Verma Pariwaar"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-theme-text-main">Custom Invitation Message</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Request the pleasure of your company..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Include Ceremonies Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-theme-text-main">
                  Included Ceremonies for this Cohort
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {events?.map((ev) => {
                    const isChecked = selectedEventIds.includes(ev.id);
                    return (
                      <label
                        key={ev.id}
                        className="flex items-center gap-2 p-2 rounded-xl border border-theme-border bg-theme-background text-xs cursor-pointer"
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
                          className="rounded-sm border-theme-border text-theme-primary focus:ring-theme-primary"
                        />
                        <span className="font-semibold">{ev.name}</span>
                        <span className="text-theme-text-muted">({ev.date})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">RSVP Contact</label>
                  <input
                    type="text"
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-text-main">Google Maps Link</label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-background text-xs sm:text-sm"
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
                  Save Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
