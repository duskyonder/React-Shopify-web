import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";

function SFNewsletter() {
  const { config } = useThemeConfig();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (!config.enableNewsletter || shown.current) return;
    shown.current = true;
    const timer = setTimeout(() => setVisible(true), config.newsletterDelay * 1000);
    return () => clearTimeout(timer);
  }, [config.enableNewsletter, config.newsletterDelay]);

  if (!visible) return null;

  const isDark = (config.newsletterTheme ?? 'dark-green') === 'dark-green';
  const bgColor = isDark ? '#0D3D2B' : '#FAF8F4';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? 'rgba(255,255,255,0.65)' : '#666';
  const inputBorder = isDark ? 'rgba(255,255,255,0.25)' : '#d0ccc7';
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
  const inputColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const btnBg = isDark ? '#FFFFFF' : '#0D3D2B';
  const btnColor = isDark ? '#0D3D2B' : '#FFFFFF';
  const closeBg = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
  const closeColor = isDark ? '#FFFFFF' : '#1A1A1A';

  const imageUrl = config.newsletterImageUrl;

  const content = (
    <div className="sf-nl-modal" style={{ background: bgColor }}>
      {/* Left image panel */}
      {imageUrl ? (
        <div className="sf-nl-image-panel">
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ) : (
        <div className="sf-nl-image-panel sf-nl-image-panel--placeholder" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: isDark ? '#fff' : '#0D3D2B' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" />
            </svg>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: isDark ? '#fff' : '#0D3D2B' }}>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor" />
            </svg>
            <span style={{ fontSize: '0.7rem', color: isDark ? '#fff' : '#0D3D2B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add Image</span>
          </div>
        </div>
      )}

      {/* Right content panel */}
      <div className="sf-nl-content-panel">
        {/* Close button */}
        <button
          className="sf-nl-close"
          onClick={() => setVisible(false)}
          style={{ background: closeBg, color: closeColor }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Tag */}
        <div className="sf-nl-tag" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#175C40', borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#175C40' }}>
          DUSKYONDER
        </div>

        {/* Title */}
        <h2 className="sf-nl-title" style={{ color: textColor }}>
          {config.newsletterTitle}
        </h2>

        {/* Subtitle / Text */}
        <p className="sf-nl-subtitle" style={{ color: mutedColor }}>
          {config.newsletterText}
        </p>

        {/* Form */}
        {submitted ? (
          <div className="sf-nl-success" style={{ color: isDark ? '#7ECBA8' : '#175C40' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Thank you! Welcome to the club.</span>
          </div>
        ) : (
          <div className="sf-nl-form">
            <input
              type="email"
              className="sf-nl-input"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && email) setSubmitted(true); }}
              style={{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: inputColor,
              }}
            />
            <button
              className="sf-nl-btn"
              style={{ background: btnBg, color: btnColor }}
              onClick={() => { if (email) setSubmitted(true); }}
            >
              Join the Club &rarr;
            </button>
          </div>
        )}

        {/* Social proof */}
        {config.newsletterSocialProof && (
          <p className="sf-nl-proof" style={{ color: mutedColor }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {config.newsletterSocialProof}
          </p>
        )}

        {/* Privacy note */}
        <p className="sf-nl-privacy" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#aaa' }}>
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    <div
      className="sf-nl-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) setVisible(false); }}
    >
      {content}
    </div>,
    document.body
  );
}

export { SFNewsletter };
