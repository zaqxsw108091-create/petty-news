import { useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from 'hooks/useReducedMotion';

interface MarqueeProps {
  text: string;
  className?: string;
}

/** 오른쪽에서 들어와 왼쪽으로 끝까지 흘러나가는 티커 (전국 티커·속보 하단 티커 공용) */
export function Marquee({ text, className }: MarqueeProps) {
  const reduceMotion = useReducedMotion();
  const clipRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const clip = clipRef.current;
    const el = textRef.current;
    if (!clip || !el || reduceMotion) return;
    const containerWidth = clip.clientWidth;
    const contentWidth = el.offsetWidth;
    if (containerWidth === 0 || contentWidth === 0) return;
    const distance = containerWidth + contentWidth;
    const animation = el.animate(
      [{ transform: `translateX(${containerWidth}px)` }, { transform: `translateX(${-contentWidth}px)` }],
      { duration: distance * 12, iterations: Infinity, easing: 'linear' }
    );
    return () => animation.cancel();
  }, [text, reduceMotion]);

  return (
    <div ref={clipRef} className={`marquee-clip ${className ?? ''}`}>
      <span ref={textRef} className={reduceMotion ? 'marquee-text static' : 'marquee-text'}>
        {text}
      </span>
    </div>
  );
}
