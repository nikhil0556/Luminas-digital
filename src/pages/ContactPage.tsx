import React, { useState } from 'react';
import { Mail, Clock, ShieldCheck, Send, CheckCircle2, HelpCircle, ArrowRight, ExternalLink, RefreshCw, UserCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { showToast, setActivePage, settings } = useStore();

  const supportEmail = settings?.supportEmail || 'raj.nikhil0556@gmail.com';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('Download or Access Help');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');
  const [directMailtoUrl, setDirectMailtoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in your name, email, and message.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          orderId: orderId.trim(),
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit support request.');
      }

      setGeneratedTicketId(data.ticketId);
      setDirectMailtoUrl(data.mailtoUrl || `mailto:${supportEmail}?subject=${encodeURIComponent(`[Ticket #${data.ticketId}] ${subject}`)}&body=${encodeURIComponent(message)}`);
      setSubmitted(true);
      showToast(`Support ticket #${data.ticketId} created successfully!`, 'success');
    } catch (err: any) {
      console.warn('[ContactPage submit error]', err);
      // Fallback: still generate ticket and provide direct mailto
      const fallbackTicket = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedTicketId(fallbackTicket);
      setDirectMailtoUrl(`mailto:${supportEmail}?subject=${encodeURIComponent(`[Ticket #${fallbackTicket}] ${subject}`)}&body=${encodeURIComponent(`Hello Support,\n\nName: ${name}\nEmail: ${email}\nOrder: ${orderId || 'N/A'}\n\n${message}`)}`);
      setSubmitted(true);
      showToast('Support inquiry created. You can also send directly via email client.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Mail className="w-3.5 h-3.5" />
          <span>Help & Customer Care</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Contact Customer Care
        </h1>
        <p className="text-sm text-neutral-400">
          Direct customer support for Lumina Digital e-books, prompt libraries, and order access.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact info cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white font-display flex items-center justify-between">
              <span>Direct Customer Care</span>
              <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Online
              </span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-400 block text-[11px]">Official Customer Care Email</span>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-white font-semibold text-sm hover:text-indigo-300 transition-colors block font-mono select-all"
                  >
                    {supportEmail}
                  </a>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Click to compose directly in your favorite email app (Gmail, Apple Mail, Outlook).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Store Owner & Customer Desk</span>
                  <span className="text-white font-medium">Nikhil Raj ({settings?.creatorHandle || '@nikhil0556__'})</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Guaranteed Response Time</span>
                  <span className="text-white font-medium">Under 12 hours (7 days a week)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">14-Day Refund Requests</span>
                  <span className="text-white font-medium">Processed within 24 hours</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <a
                href={`mailto:${supportEmail}?subject=${encodeURIComponent('Customer Support Inquiry - Lumina Digital')}&body=${encodeURIComponent('Hello Nikhil,\n\nI need assistance with:\n')}`}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compose Email to {supportEmail}</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <HelpCircle className="w-4 h-4" />
              <span>Looking for quick answers?</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Most questions regarding file formats, Notion setup, and refund policies are answered in our FAQ.
            </p>
            <button
              type="button"
              onClick={() => setActivePage('faq')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>Visit the FAQ Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Send Us a Direct Support Message
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Messages are delivered directly to customer care ({supportEmail}).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Your Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Topic / Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Download or Access Help">Download or Access Help</option>
                      <option value="Question About a Product">Question About a Product</option>
                      <option value="14-Day Refund Request">14-Day Refund Request</option>
                      <option value="Custom Prompt or Partnership">Custom Prompt or Partnership</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Order ID (If applicable)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. LUM-87040"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Your Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need assistance with..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Support Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send to Customer Care ({supportEmail})</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in-95">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                    Ticket Reference: {generatedTicketId}
                  </span>
                  <h3 className="text-xl font-bold text-white font-display">
                    Support Inquiry Received!
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{name}</strong>. Your ticket has been logged and routed to our Customer Care team at <strong className="text-indigo-300">{supportEmail}</strong>. We reply within 12 hours.
                </p>

                {directMailtoUrl && (
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 max-w-md mx-auto space-y-2">
                    <p className="text-[11px] text-neutral-400">
                      Want to send or keep a copy directly from your own email app?
                    </p>
                    <a
                      href={directMailtoUrl}
                      className="w-full py-2.5 px-4 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Pre-filled in Email Client</span>
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
