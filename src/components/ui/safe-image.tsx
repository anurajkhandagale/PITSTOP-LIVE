"use client";

export function SafeImage({ src, alt, fallbackSrc, className }: { src: string, alt: string, fallbackSrc: string, className?: string }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={(e) => { 
        e.currentTarget.onerror = null; 
        e.currentTarget.src = fallbackSrc; 
      }} 
    />
  );
}
