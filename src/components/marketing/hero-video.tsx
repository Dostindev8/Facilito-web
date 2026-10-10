'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { HERO_POSTER } from '@/lib/hero-media-shared';

const FADE_MS = 800;

/** Poster is the LCP image. The loop only mounts when encoded files exist and the visitor can afford motion. */
export function HeroVideo({ videoReady, allowMotion, paused }: { videoReady: boolean; allowMotion: boolean; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const enabled = videoReady && allowMotion;

  useEffect(() => {
    const video = ref.current;
    if (!enabled || !video) return;
    if (paused) video.pause();
    else video.play().catch(() => setPlaying(false));
  }, [enabled, paused]);

  return (
    <div className="mkt-hero-fill">
      <Image src={HERO_POSTER} alt="" fill priority unoptimized sizes="100vw" className="mkt-hero-poster" />
      {enabled && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          className="mkt-hero-video"
          style={{ opacity: playing ? 1 : 0, transition: `opacity ${FADE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)` }}
        >
          <source src="/media/facilito-hero-1080-loop.webm" type="video/webm" media="(min-width: 1024px)" />
          <source src="/media/facilito-hero-1080-loop.mp4" type="video/mp4" media="(min-width: 1024px)" />
          <source src="/media/facilito-hero-720-loop.webm" type="video/webm" />
          <source src="/media/facilito-hero-720-loop.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
