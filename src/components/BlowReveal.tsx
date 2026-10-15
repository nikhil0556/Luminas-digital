import React, { useState } from 'react';
import { motion } from 'motion/react';

export interface BlowRevealProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'breeze';
  delay?: number;
  duration?: number;
  className?: string;
  gustSweep?: boolean;
  repeat?: boolean;
  as?: 'div' | 'section' | 'article' | 'span';
}

export const BlowReveal: React.FC<BlowRevealProps> = ({
  children,
  direction = 'breeze',
  delay = 0,
  duration = 0.85,
  className = '',
  gustSweep = true,
  repeat = false,
  as = 'div'
}) => {
  const [hasBlown, setHasBlown] = useState(false);

  // Directional wind drift offset calculation
  const getInitialOffsets = () => {
    switch (direction) {
      case 'left':
        return { x: -36, y: 16, rotate: -2, skewX: -2 };
      case 'right':
        return { x: 36, y: 16, rotate: 2, skewX: 2 };
      case 'up':
        return { x: 0, y: 36, rotate: 0.5, skewX: -1 };
      case 'breeze':
      default:
        return { x: -26, y: 24, rotate: -1.2, skewX: -1.5 };
    }
  };

  const initialOffset = getInitialOffsets();

  const MotionComponent = (motion as any)[as] || motion.div;

  return (
    <MotionComponent
      className={`relative ${className}`}
      initial={{
        opacity: 0,
        x: initialOffset.x,
        y: initialOffset.y,
        rotate: initialOffset.rotate,
        skewX: initialOffset.skewX,
        filter: 'blur(5px)'
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        skewX: 0,
        filter: 'blur(0px)'
      }}
      viewport={{ once: !repeat, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      onAnimationComplete={() => {
        setHasBlown(true);
      }}
    >
      {children}

      {/* Luminous wind gust ray that sweeps across when the person reaches the section */}
      {gustSweep && (
        <span
          className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-[inherit]"
          aria-hidden="true"
        >
          <span
            className="absolute -inset-y-full -left-[160%] w-[120%] rotate-12 bg-gradient-to-r from-transparent via-cyan-400/10 via-indigo-400/15 via-white/10 to-transparent opacity-0 mix-blend-overlay"
            style={{
              animation: 'blow-wind-sweep 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              animationDelay: `${delay + 0.15}s`
            }}
          />
        </span>
      )}
    </MotionComponent>
  );
};

export default BlowReveal;
