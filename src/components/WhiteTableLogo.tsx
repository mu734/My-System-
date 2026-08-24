import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  dark?: boolean;
  color?: string;
  variant?: 'standard' | 'badge' | 'solid-black' | 'solid-green';
}

export const WhiteTableLogo: React.FC<LogoProps> = ({
  size = 36,
  className = '',
  dark = false,
  color,
  variant = 'standard',
}) => {
  // Determine stroke color based on props & theme
  const strokeColor = color
    ? color
    : variant === 'solid-black'
    ? '#000000'
    : variant === 'solid-green'
    ? '#10b981'
    : dark
    ? '#FFFFFF'
    : '#09090b';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circular badge frame */}
      <circle cx="100" cy="100" r="88" stroke={strokeColor} strokeWidth="11" />

      {/* "T" top crossbar */}
      <path
        d="M 82 54 L 118 54"
        stroke={strokeColor}
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* "T" center vertical bar down into "W" */}
      <path
        d="M 100 54 L 100 84"
        stroke={strokeColor}
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* "W" structure */}
      <path
        d="M 64 54 L 86 106 L 100 84 L 114 106 L 136 54"
        stroke={strokeColor}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Table Top Surface (Oval ellipse) */}
      <ellipse
        cx="100"
        cy="116"
        rx="38"
        ry="9"
        fill="none"
        stroke={strokeColor}
        strokeWidth="9"
      />

      {/* Table Under-rim */}
      <path
        d="M 62 118 C 62 130, 138 130, 138 118"
        fill="none"
        stroke={strokeColor}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Table Center Pedestal Stem */}
      <path
        d="M 100 126 L 100 188"
        stroke={strokeColor}
        strokeWidth="11"
        strokeLinecap="round"
      />
    </svg>
  );
};

