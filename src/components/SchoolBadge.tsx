import React, { useState } from 'react';

export interface SchoolBadgeProps {
  logoUrl?: string;
  badgeStyle?: 'default' | 'royal' | 'torch' | 'globe';
  schoolName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export const SchoolBadge: React.FC<SchoolBadgeProps> = ({
  logoUrl,
  badgeStyle = 'default',
  schoolName = 'Richsolight International School',
  size = 'md',
  className = '',
  alt = 'School Crest',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-28 h-28 sm:w-32 sm:h-32',
  };

  // If a valid custom logo image exists and hasn't errored
  if (logoUrl && !imageError) {
    return (
      <img
        src={logoUrl}
        alt={alt || `${schoolName} Crest`}
        onError={() => setImageError(true)}
        className={`object-contain shrink-0 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  // Vector Badge Presets
  const renderVectorBadge = () => {
    switch (badgeStyle) {
      case 'royal':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="royalNavy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            {/* Outer Laurel / Wreath Circle */}
            <circle cx="50" cy="50" r="46" stroke="url(#goldGrad)" strokeWidth="3" strokeDasharray="6 2" />
            <circle cx="50" cy="50" r="41" fill="url(#royalNavy)" stroke="#D97706" strokeWidth="1.5" />
            
            {/* Crown on Top */}
            <path d="M32 40 L38 28 L50 35 L62 28 L68 40 Z" fill="url(#goldGrad)" />
            <circle cx="38" cy="26" r="2" fill="#FEF08A" />
            <circle cx="50" cy="33" r="2.5" fill="#FEF08A" />
            <circle cx="62" cy="26" r="2" fill="#FEF08A" />
            
            {/* Open Book */}
            <path d="M35 50 Q50 48 50 56 Q50 48 65 50 L65 72 Q50 70 50 78 Q50 70 35 72 Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
            <line x1="50" y1="56" x2="50" y2="78" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="39" y1="56" x2="47" y2="57" stroke="#94A3B8" strokeWidth="1" />
            <line x1="39" y1="62" x2="47" y2="63" stroke="#94A3B8" strokeWidth="1" />
            <line x1="53" y1="57" x2="61" y2="56" stroke="#94A3B8" strokeWidth="1" />
            <line x1="53" y1="63" x2="61" y2="62" stroke="#94A3B8" strokeWidth="1" />
            
            {/* Star Base */}
            <polygon points="50,80 52,85 57,85 53,88 55,93 50,90 45,93 47,88 43,85 48,85" fill="url(#goldGrad)" />
          </svg>
        );

      case 'torch':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="torchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>
              <linearGradient id="emeraldBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#065F46" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>
            </defs>
            <polygon points="50,5 92,26 92,74 50,95 8,74 8,26" fill="url(#emeraldBase)" stroke="#F59E0B" strokeWidth="3" />
            
            {/* Flame */}
            <path d="M50 20 C42 30 40 40 45 46 C47 38 52 35 50 20 Z" fill="url(#torchGrad)" />
            <path d="M50 20 C58 30 60 40 55 46 C53 38 48 35 50 20 Z" fill="#FBBF24" />
            
            {/* Torch handle */}
            <path d="M46 48 L54 48 L52 75 L48 75 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
            <rect x="44" y="46" width="12" height="4" rx="1" fill="#FEF08A" />
            
            {/* Stars */}
            <polygon points="26,45 28,50 33,50 29,53 31,58 26,55 21,58 23,53 19,50 24,50" fill="#FEF08A" />
            <polygon points="74,45 76,50 81,50 77,53 79,58 74,55 69,58 71,53 67,50 72,50" fill="#FEF08A" />
          </svg>
        );

      case 'globe':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0E7490" />
                <stop offset="100%" stopColor="#155E75" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="url(#tealGrad)" stroke="#38BDF8" strokeWidth="3" />
            
            {/* Globe Lat/Long */}
            <circle cx="50" cy="50" r="32" stroke="#E0F2FE" strokeWidth="1.5" fill="none" opacity="0.6" />
            <ellipse cx="50" cy="50" rx="16" ry="32" stroke="#E0F2FE" strokeWidth="1.5" fill="none" opacity="0.6" />
            <line x1="18" y1="50" x2="82" y2="50" stroke="#E0F2FE" strokeWidth="1.5" opacity="0.6" />
            
            {/* Center Quill / Torch */}
            <path d="M50 26 L56 46 L50 68 L44 46 Z" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1" />
            <polygon points="50,18 53,24 47,24" fill="#FBBF24" />
          </svg>
        );

      case 'default':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shieldNavy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="60%" stopColor="#172554" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="35%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="goldInner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>

            {/* Heraldic Shield Outline */}
            <path
              d="M50 6 C74 6 86 14 86 26 C86 58 68 84 50 94 C32 84 14 58 14 26 C14 14 26 6 50 6 Z"
              fill="url(#shieldNavy)"
              stroke="url(#goldBorder)"
              strokeWidth="4"
            />
            {/* Inner accent contour line */}
            <path
              d="M50 12 C70 12 80 18 80 28 C80 54 64 76 50 86 C36 76 20 54 20 28 C20 18 30 12 50 12 Z"
              stroke="#FBBF24"
              strokeWidth="1"
              strokeDasharray="3 1.5"
              fill="none"
              opacity="0.7"
            />

            {/* Central Sunburst / Beacon behind elements */}
            <circle cx="50" cy="38" r="14" fill="#F59E0B" opacity="0.2" />

            {/* 3 Radiating Excellence Stars */}
            <polygon points="50,18 52,23 57,23 53,26 55,31 50,28 45,31 47,26 43,23 48,23" fill="url(#goldInner)" />
            <polygon points="32,24 33.5,27.5 37,27.5 34,29.5 35.5,33 32,31 28.5,33 30,29.5 27,27.5 30.5,27.5" fill="url(#goldInner)" />
            <polygon points="68,24 69.5,27.5 73,27.5 70,29.5 71.5,33 68,31 64.5,33 66,29.5 63,27.5 66.5,27.5" fill="url(#goldInner)" />

            {/* Open Book of Academic Excellence */}
            <path
              d="M30 46 Q50 43 50 51 Q50 43 70 46 L70 66 Q50 63 50 71 Q50 63 30 66 Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="1.5"
            />
            {/* Book spine */}
            <line x1="50" y1="51" x2="50" y2="71" stroke="#1E293B" strokeWidth="2" />
            {/* Book lines - Left page */}
            <line x1="35" y1="52" x2="46" y2="53" stroke="#64748B" strokeWidth="1" />
            <line x1="35" y1="57" x2="46" y2="58" stroke="#64748B" strokeWidth="1" />
            <line x1="35" y1="62" x2="46" y2="63" stroke="#64748B" strokeWidth="1" />
            {/* Book lines - Right page */}
            <line x1="54" y1="53" x2="65" y2="52" stroke="#64748B" strokeWidth="1" />
            <line x1="54" y1="58" x2="65" y2="57" stroke="#64748B" strokeWidth="1" />
            <line x1="54" y1="63" x2="65" y2="62" stroke="#64748B" strokeWidth="1" />

            {/* Lower Banner Ribbon */}
            <path
              d="M24 74 L50 79 L76 74 L70 82 L50 86 L30 82 Z"
              fill="url(#goldBorder)"
              stroke="#78350F"
              strokeWidth="0.8"
            />
            {/* Torch flame at center bottom crest */}
            <path d="M50 36 C47 41 47 45 50 48 C53 45 53 41 50 36 Z" fill="#EF4444" />
            <path d="M50 39 C48.5 42 48.5 44 50 46 C51.5 44 51.5 42 50 39 Z" fill="#FBBF24" />
          </svg>
        );
    }
  };

  return (
    <div className={`shrink-0 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {renderVectorBadge()}
    </div>
  );
};
