import React, { useState } from 'react';
import {
  Link2,
  Copy,
  ExternalLink,
  Check,
  QrCode,
  Download,
  Trash2,
} from 'lucide-react';
import { nanoid } from 'nanoid';

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
}

function App() {
  const [url, setUrl] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error(
          'Please enter a valid URL starting with http:// or https://'
        );
      }

      const shortId = nanoid(6);
      const response = await fetch('http://localhost:3001/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: shortId,
          url: url,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create short URL');
      }
      
      const baseUrl = window.location.origin;
      const newShortUrl = `${baseUrl}/${shortId}`;
      
      setShortenedUrls(prev => [{
        id: shortId,
        originalUrl: url,
        shortUrl: newShortUrl,
        createdAt: new Date(),
      }, ...prev]);
      
      setUrl('');
      showToast('URL shortened successfully!');
    } catch (err) {
      console.error('Error shortening URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (shortUrl: string) => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(shortUrl);
      showToast('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    } finally {
      setIsCopying(false);
    }
  };

  const toggleQrCode = (id: string | null) => {
    setShowQrCode(id);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowCopyToast(true);
    setTimeout(() => {
      setShowCopyToast(false);
    }, 2000);
  };

  const downloadQrCode = async (shortUrl: string) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
        shortUrl
      )}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('QR code downloaded!');
    } catch (err) {
      console.error('Failed to download QR code:', err);
      setError('Failed to download QR code');
    }
  };

  const removeUrl = (id: string) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== id));
    showToast('URL removed from list');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 animate-gradient-x">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            {/* Header with floating animation */}
            <div className="text-center mb-12 animate-fade-in">
              <div 
                className={`inline-block p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-6 shadow-lg shadow-green-500/20 transition-all duration-500 ease-in-out transform hover:rotate-12 hover:scale-110 cursor-pointer ${
                  isHovered ? 'animate-pulse' : ''
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Link2 className="w-10 h-10 text-white animate-spin-slow" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4 animate-slide-down">
                MDES-Short
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto animate-fade-in-up">
                Transform your long URLs into short, memorable links in seconds
              </p>
            </div>

            {/* URL Input Form with hover effect */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-white/20 transition-all duration-300 hover:shadow-2xl hover:bg-white/90 animate-slide-up">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="url"
                    className="text-sm font-medium text-gray-700"
                  >
                    Enter your long URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    required
                    placeholder="https://example.com/very-long-url..."
                    className="px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm hover:shadow-md"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg animate-shake">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-xl text-white font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] duration-200
                    ${
                      isLoading
                        ? 'bg-emerald-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-green-500/30'
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Shortening...</span>
                    </div>
                  ) : (
                    'Shorten URL'
                  )}
                </button>
              </form>
            </div>

            {/* Results List with slide-in animation */}
            {shortenedUrls.length > 0 && (
              <div className="space-y-4">
                {shortenedUrls.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-slide-up"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500 truncate">
                          {item.originalUrl}
                        </h3>
                        <button
                          onClick={() => removeUrl(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove URL"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100/50 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center space-x-3">
                          <ExternalLink className="w-5 h-5 text-emerald-600 animate-bounce-gentle" />
                          <a
                            href={item.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium transition-colors duration-200"
                          >
                            {item.shortUrl}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleQrCode(item.id)}
                            className="p-2.5 hover:bg-white rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.shortUrl)}
                            disabled={isCopying}
                            className="p-2.5 hover:bg-white rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110 relative"
                            title="Copy to clipboard"
                          >
                            {isCopying ? (
                              <Check className="w-5 h-5 text-green-600 animate-check" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Toast Notification */}
            {showCopyToast && (
              <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg py-3 px-4 transition-all duration-300 transform translate-y-0 opacity-100 flex items-center space-x-2 border border-gray-100 animate-slide-in-right">
                <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                  <Check className="w-4 h-4 text-green-600 animate-check" />
                </div>
                <span className="text-gray-700 font-medium">{toastMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal - Moved outside main container for better stacking context */}
      {showQrCode && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]"
          style={{ position: 'fixed', isolation: 'isolate' }}
          onClick={() => toggleQrCode(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 opacity-100 animate-modal-in relative"
            style={{ isolation: 'isolate' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  QR Code
                </h3>
                <button
                  onClick={() => toggleQrCode(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg transform hover:rotate-90 duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl flex justify-center items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    shortenedUrls.find(url => url.id === showQrCode)?.shortUrl || ''
                  )}`}
                  alt="QR Code"
                  className="w-56 h-56 animate-fade-in"
                />
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    const url = shortenedUrls.find(url => url.id === showQrCode)?.shortUrl;
                    if (url) downloadQrCode(url);
                  }}
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] duration-200 font-medium"
                >
                  <Download className="w-5 h-5 animate-bounce-gentle" />
                  <span>Download QR Code</span>
                </button>
              </div>
              <p className="text-center mt-6 text-sm text-gray-500">
                Scan this QR code to access the shortened URL
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;