'use client';

import { useEffect, useRef } from 'react';
import { AppCore, AppConfig, GalleryItem } from './circular-gallery-bundle';

export interface CircularGalleryProps extends AppConfig {
  className?: string;
}

export function CircularGallery({
  items,
  bend = 3,
  textColor,
  borderRadius = 0.05,
  font,
  scrollSpeed = 2.2,
  scrollEase = 0.05,
  autoScroll = true,
  onActiveChange,
  className = ''
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<AppCore | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new AppCore(containerRef.current, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      autoScroll,
      onActiveChange
    });
    appRef.current = app;

    return () => {
      app.destroy();
      appRef.current = null;
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, autoScroll, onActiveChange]);

  return (
    <div
      className={`w-full h-full overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      ref={containerRef}
    />
  );
}

export default CircularGallery;
