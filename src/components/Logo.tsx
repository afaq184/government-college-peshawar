import React from 'react';

interface LogoProps {
  /** Extra Tailwind classes (e.g. rounded-full). */
  className?: string;
  /** Width and height in pixels; logo is square/circular artwork. */
  size?: number;
}

const logoSrc = `${import.meta.env.BASE_URL}gcp-logo.png`;

export default function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <img
      src={logoSrc}
      width={size}
      height={size}
      alt="Government College Peshawar"
      className={`object-contain select-none shrink-0 ${className}`}
      decoding="async"
    />
  );
}
