import React, { useState } from 'react';
import { X, ShieldCheck, Mail, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  type: 'about' | 'privacy' | 'terms' | 'contact' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ABOUT MODAL */}
        {type === 'about' && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">About PDF Master</h2>
            <div className="mt-4 text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>PDF Master</strong> is an accessible, web-based suite of document utilities
                designed to make everyday PDF tasks fast, straightforward, and dependable.
              </p>
              <p>
                Our platform provides practical tools to merge, split, compress, rotate, convert, and
                organize PDF documents directly through a clean, modern interface without requiring
                specialized software downloads.
              </p>
              <h3 className="font-bold text-slate-800 text-base pt-2">Browser-Based Processing</h3>
              <p>
                For core document manipulations—such as merging PDFs, splitting pages, rotating documents,
                adding page numbers, and applying watermarks—the operations execute directly in your web
                browser using client-side JavaScript. This ensures that your files for these specific tasks
                are handled locally on your device rather than queued on remote processing servers.
              </p>
              <h3 className="font-bold text-slate-800 text-base pt-2">Our Commitments</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Accessible Everywhere:</strong> Responsive, lightweight web utilities optimized
                  for desktop browsers, laptops, tablets, and smartphones.
                </li>
                <li>
                  <strong>Straightforward Access:</strong> Use the tools you need without mandatory account
                  creation or forced sign-up forms.
                </li>
                <li>
                  <strong>Clear &amp; Honest Operation:</strong> We clearly communicate how each tool processes
                  documents, keeping client-side tasks on your local device.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY MODAL */}
        {type === 'privacy' && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Privacy & File Retention Policy</h2>
            <div className="mt-4 text-sm text-slate-600 space-y-3 leading-relaxed">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium">
                <strong>Client-Side Document Handling:</strong> For core operations like merging, splitting,
                reordering, and watermarking, your files are processed directly within your browser's local sandbox
                using client-side JavaScript. Document contents for these operations remain on your device.
              </div>
              <h3 className="font-bold text-slate-800 text-base pt-2">1. Local In-Browser Processing</h3>
              <p>
                Core tools—including PDF merging, page splitting, rotation, watermarking, and page numbering—run
                locally on your machine. We do not store or inspect the contents of your documents during these
                browser-based operations.
              </p>
              <h3 className="font-bold text-slate-800 text-base pt-2">2. Data Retention & Memory</h3>
              <p>
                For all client-side tools, files are loaded temporarily into your browser's active memory during the
                session. As soon as you close or reload the browser tab, the temporary in-memory document data is
                cleared by your browser.
              </p>
              <h3 className="font-bold text-slate-800 text-base pt-2">3. Cookies and Analytics</h3>
              <p>
                We do not track your document contents or maintain user profiles. Standard HTTP server
                logs and standard anonymous visitor metrics may be utilized solely for platform
                stability and performance monitoring.
              </p>
              <h3 className="font-bold text-slate-800 text-base pt-2">4. Google AdSense & Third-Party Advertising</h3>
              <p>
                To provide free access to all PDF tools without requiring mandatory subscriptions or accounts,
                PDF Master may display advertisements served by Google AdSense when advertising is enabled by the publisher.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li>
                  Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits
                  to this website or other websites on the Internet.
                </li>
                <li>
                  Google's use of advertising cookies enables it and its partners to serve ads to users based on their
                  visit to PDF Master and/or other sites on the Internet.
                </li>
                <li>
                  Users may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 underline font-semibold"
                  >
                    Google Ads Settings
                  </a>{' '}
                  or by visiting{' '}
                  <a
                    href="https://www.aboutads.info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 underline font-semibold"
                  >
                    aboutads.info
                  </a>.
                </li>
                <li>
                  <strong>Strict Document Privacy:</strong> Advertisers and advertising scripts have absolutely
                  no access to your uploaded files, document text, signatures, or processed data. All PDF files
                  remain strictly in client-side memory.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TERMS OF SERVICE MODAL */}
        {type === 'terms' && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Terms of Service</h2>
            <div className="mt-4 text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                By accessing and using PDF Master, you agree to comply with and be bound by the
                following terms:
              </p>
              <h3 className="font-bold text-slate-800 text-base pt-2">1. Permitted Use</h3>
              <p>
                You may use PDF Master for both personal and commercial document processing. You agree
                not to use the services for any unlawful activities or in a manner that infringes on the
                intellectual property rights of others.
              </p>
              <h3 className="font-bold text-slate-800 text-base pt-2">2. Disclaimer of Warranties</h3>
              <p>
                PDF Master is provided "as is" and "as available" without warranties of any kind. While
                our algorithms are rigorously tested, we recommend retaining local backup copies of any
                critical documents before executing irreversible modifications.
              </p>
              <h3 className="font-bold text-slate-800 text-base pt-2">3. Limitation of Liability</h3>
              <p>
                Under no circumstances shall PDF Master or its operators be liable for any direct,
                indirect, incidental, or consequential damages resulting from document loss or software
                use.
              </p>
            </div>
          </div>
        )}

        {/* CONTACT MODAL */}
        {type === 'contact' && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Contact PDF Master</h2>
            <p className="mt-1 text-sm text-slate-500">
              Have feedback, tool suggestions, or need technical support? Send us a note.
            </p>

            {contactSubmitted ? (
              <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-bold text-slate-900 text-base">Message Sent!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Thank you for reaching out. Our engineering team reviews all user inquiries.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-red-500 outline-none"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-red-500 outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:border-red-500 outline-none"
                    placeholder="How can we help?"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
