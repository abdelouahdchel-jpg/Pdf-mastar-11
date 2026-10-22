import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ContactPageProps {
  onBackToHome: () => void;
  onOpenPrivacyPolicy: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onBackToHome,
  onOpenPrivacyPolicy,
}) => {
  const supportEmail = 'brayachmohamad@gmail.com';

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // UI & Submission state
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<{
    email?: string;
    subject?: string;
    message?: string;
  }>({});

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(supportEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; subject?: string; message?: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g., name@example.com).';
    }

    // Subject validation
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required.';
    } else if (subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters long.';
    }

    // Message validation
    if (!message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Please provide a little more detail in your message (at least 10 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateMailtoUrl = () => {
    const subjectParam = encodeURIComponent(subject.trim() || 'Inquiry regarding PDF Master');
    const senderName = name.trim() ? `Sender: ${name.trim()}\n` : '';
    const senderEmail = email.trim() ? `Sender Email: ${email.trim()}\n\n` : '';
    const bodyContent = `${senderName}${senderEmail}${message.trim() || 'Hello PDF Master Support,\n\n'}`;
    const bodyParam = encodeURIComponent(bodyContent);
    return `mailto:${supportEmail}?subject=${subjectParam}&body=${bodyParam}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Determine the delivery endpoint
    // 1. Custom configured environment variable if provided
    // 2. Real working FormSubmit AJAX endpoint connected directly to the official support email
    const customEndpoint = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CONTACT_FORM_ENDPOINT;
    const endpoint = customEndpoint || `https://formsubmit.co/ajax/${supportEmail}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous User',
          email: email.trim(),
          _subject: `[PDF Master Contact] ${subject.trim()}`,
          subject: subject.trim(),
          message: message.trim(),
          _template: 'table',
        }),
      });

      if (!response.ok) {
        throw new Error(`Delivery service returned HTTP ${response.status}`);
      }

      const data = await response.json().catch(() => null);

      // Verify that the delivery was actually accepted
      if (data && (data.success === 'false' || data.success === false)) {
        throw new Error(data.message || 'Delivery service was unable to forward your message.');
      }

      // Successful delivery confirmed by the service
      setSubmitStatus('success');
    } catch (err: unknown) {
      // Do not pretend the message was sent!
      const errText =
        err instanceof Error ? err.message : 'Network or delivery service error encountered.';
      setSubmitStatus('error');
      setErrorMessage(
        `We could not deliver your message automatically through the web service (${errText}). You can send your message directly via your email client to ${supportEmail} using the button below.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSubmitStatus('idle');
    setErrorMessage('');
    setErrors({});
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Tools</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold tracking-wide uppercase mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>Support &amp; Feedback</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact Us
          </h1>

          <div className="mt-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              We're Here to Help
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Thank you for using PDF Master. We value your feedback and are committed to making your
              document management experience simple and convenient.
            </p>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              If you have questions about our tools, encounter a technical issue, or would like to
              suggest an improvement, please contact us.
            </p>
          </div>

          {/* Official Support Email Banner */}
          <div className="mt-6 p-4 sm:p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Official Support Email
              </span>
              <a
                href={`mailto:${supportEmail}`}
                className="text-base sm:text-lg font-mono font-bold text-white hover:text-red-400 transition-colors underline decoration-slate-700 underline-offset-4 flex items-center gap-2 break-all"
                title={`Send email directly to ${supportEmail}`}
              >
                <span>{supportEmail}</span>
                <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 inline" />
              </a>
              <p className="text-xs text-slate-400">
                Click to open your preferred email client or copy the address.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors w-full sm:w-auto cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm w-full sm:w-auto shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Compose Mail</span>
              </a>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10">
          {submitStatus === 'success' ? (
            /* Success State */
            <div className="p-8 sm:p-12 text-center bg-emerald-50/60 border border-emerald-200 rounded-3xl animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Message Sent Successfully!
              </h3>
              <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Thank you for contacting us. Your message has been delivered to{' '}
                <strong className="text-slate-900">{supportEmail}</strong>. Our team reviews all
                inquiries and will get back to you as soon as possible.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Return to Tools
                </button>
              </div>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Delivery failure / error notice */}
              {submitStatus === 'error' && (
                <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-sm animate-in fade-in space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-950">Message Delivery Notice</p>
                      <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
                        {errorMessage}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={generateMailtoUrl()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send directly using your email app</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowConfigGuide(!showConfigGuide)}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-800 hover:text-rose-950 underline cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{showConfigGuide ? 'Hide details' : 'How to configure form delivery'}</span>
                    </button>
                  </div>

                  {showConfigGuide && (
                    <div className="mt-3 p-3.5 bg-white rounded-xl border border-rose-200 text-xs text-slate-700 space-y-2">
                      <p className="font-semibold text-slate-900">
                        Configuring a Form Delivery Service:
                      </p>
                      <p>
                        To route submissions via a custom backend or form relay service without relying on
                        public endpoints, set the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">VITE_CONTACT_FORM_ENDPOINT</code>{' '}
                        environment variable in your Netlify or hosting provider build settings to your
                        form webhook endpoint (e.g., Formspree, FormSubmit, Web3Forms, or custom server route).
                      </p>
                      <p>
                        In all cases, inquiries can always be sent directly to{' '}
                        <strong className="text-slate-900">{supportEmail}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Grid: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name (Optional) */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Name <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Email Address (Required) */}
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Email Address <span className="text-red-600 font-bold">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                      errors.email
                        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                        : 'border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Subject (Required) */}
              <div>
                <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Subject <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                  }}
                  placeholder="e.g., Question about Merge PDF or tool suggestion"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
                    errors.subject
                      ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.subject}</span>
                  </p>
                )}
              </div>

              {/* Message (Required) */}
              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Message <span className="text-red-600 font-bold">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  placeholder="Please describe your question, bug report, or feedback in detail..."
                  className={`w-full p-4 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all resize-y ${
                    errors.message
                      ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              {/* Privacy Notice Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Please do not include passwords, payment details, confidential documents, or other
                  sensitive personal information in your message. Information submitted through this form
                  will be handled according to our{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacyPolicy}
                    className="text-red-600 hover:text-red-700 underline font-semibold cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Prefer your own email client?{' '}
                  <a
                    href={generateMailtoUrl()}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Send with email app
                  </a>
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-red-600 hover:bg-red-700 active:scale-98 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Service Configuration Assistance / Transparency */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>We typically respond to technical and tool inquiries within 24–48 hours.</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>PDF Master Direct Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
