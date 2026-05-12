/**
 * ═══════════════════════════════════════════════════════════════════════════
 * YAPROOM ANIMATION UTILITIES — Framer Motion Variants & Helpers
 *
 * Research-backed gaming UX animations:
 * - Snappy spring transitions (not sluggish eases)
 * - Staggered children for lists
 * - Glow pulse effects for attention
 * - Scale-on-tap for tactile feedback
 * - Slide/fade for page transitions
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { Variants, Transition } from "framer-motion";

// ═══════════════════════════════════════════════════════════════════════════
// TRANSITION PRESETS
// ═══════════════════════════════════════════════════════════════════════════

/** Snappy spring — primary gaming feel. Quick, bouncy, satisfying. */
export const springSnap: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.8,
};

/** Softer spring — for larger elements, less aggressive bounce. */
export const springGentle: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 1,
};

/** Bouncy spring — for celebratory moments, score reveals. */
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 12,
  mass: 0.6,
};

/** Smooth tween — for opacity fades, no bounce needed. */
export const tweenSmooth: Transition = {
  type: "tween",
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

/** Fast tween — for micro-interactions, hover states. */
export const tweenFast: Transition = {
  type: "tween",
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

/** Expo out — for dramatic reveals, page transitions. */
export const tweenExpo: Transition = {
  type: "tween",
  duration: 0.6,
  ease: [0.19, 1, 0.22, 1],
};

// ═══════════════════════════════════════════════════════════════════════════
// STAGGER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/** Creates stagger children config for list animations. */
export function stagger(delayPerChild = 0.05): Transition {
  return {
    staggerChildren: delayPerChild,
    delayChildren: 0.05,
  };
}

/** Standard container variant that staggers its children. */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PAGE TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Page enter/exit — slide up + fade. Used for route transitions. */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: tweenExpo,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: tweenSmooth,
  },
};

/** Page enter from right — for forward navigation feel. */
export const pageSlideRight: Variants = {
  initial: {
    opacity: 0,
    x: 60,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: tweenExpo,
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: tweenSmooth,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REVEAL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Fade in + slide up — most common reveal. */
export const revealUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 28,
    },
  },
};

/** Scale in from center — for modals, dialogs, cards. */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSnap,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: tweenFast,
  },
};

/** Fade in only — for subtle reveals. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: tweenSmooth,
  },
};

/** Slide in from left — for sidebars, drawers. */
export const slideInLeft: Variants = {
  hidden: {
    x: "-100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 30,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: tweenSmooth,
  },
};

/** Slide in from right — for panels, notifications. */
export const slideInRight: Variants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 30,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: tweenSmooth,
  },
};

/** Slide in from bottom — for bottom sheets, toasts. */
export const slideInUp: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: springSnap,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: tweenSmooth,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LIST / GRID ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Staggered list item — each child fades up one by one. */
export const listItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

/** Grid item — scale + fade for card grids. */
export const gridItem: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springGentle,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTION ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Tap/click scale — for buttons, cards, interactive elements. */
export const tapScale = {
  scale: 0.96,
  transition: tweenFast,
};

/** Hover lift — subtle raise on hover. */
export const hoverLift = {
  y: -3,
  transition: tweenFast,
};

/** Hover scale — slight grow on hover. */
export const hoverScale = {
  scale: 1.03,
  transition: tweenFast,
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOW / PULSE ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Cyan glow pulse — breathing attention effect. */
export const glowPulseCyan: Variants = {
  idle: {
    boxShadow: "0 0 8px rgba(0, 245, 255, 0.15)",
  },
  pulse: {
    boxShadow: [
      "0 0 8px rgba(0, 245, 255, 0.15)",
      "0 0 25px rgba(0, 245, 255, 0.35)",
      "0 0 8px rgba(0, 245, 255, 0.15)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/** Magenta glow pulse — for danger/warning attention. */
export const glowPulseMagenta: Variants = {
  idle: {
    boxShadow: "0 0 8px rgba(255, 0, 110, 0.15)",
  },
  pulse: {
    boxShadow: [
      "0 0 8px rgba(255, 0, 110, 0.15)",
      "0 0 25px rgba(255, 0, 110, 0.35)",
      "0 0 8px rgba(255, 0, 110, 0.15)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/** Lime glow pulse — for success/ready states. */
export const glowPulseLime: Variants = {
  idle: {
    boxShadow: "0 0 8px rgba(57, 255, 20, 0.15)",
  },
  pulse: {
    boxShadow: [
      "0 0 8px rgba(57, 255, 20, 0.15)",
      "0 0 25px rgba(57, 255, 20, 0.35)",
      "0 0 8px rgba(57, 255, 20, 0.15)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// GAME-SPECIFIC ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Card flip — for game reveals (Undercover, Codenames). */
export const cardFlip: Variants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

/** Vote reveal — dramatic scale + glow for vote results. */
export const voteReveal: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: springBouncy,
  },
};

/** Score counter — numbers count up with bounce. */
export const scorePopup: Variants = {
  hidden: {
    scale: 0.5,
    opacity: 0,
    y: 20,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: springBouncy,
  },
};

/** Timer pulse — gets more intense as time runs out. */
export const timerUrgent: Variants = {
  normal: {
    scale: 1,
    opacity: 1,
  },
  warning: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
    },
  },
  danger: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.6, 1],
    transition: {
      duration: 0.4,
      repeat: Infinity,
    },
  },
};

/** Shake — for error feedback, wrong answers. */
export const shake: Variants = {
  shake: {
    x: [0, -6, 6, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
};

/** Confetti burst — for win celebrations. Spawns multiple particles. */
export const confettiPiece: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: 0,
  },
  visible: (i: number) => ({
    opacity: [0, 1, 1, 0],
    scale: [0, 1.2, 1, 0.8],
    rotate: i * 45,
    x: [0, (i % 2 === 0 ? 1 : -1) * (40 + i * 15)],
    y: [0, -(60 + i * 20)],
    transition: {
      duration: 1.2,
      delay: i * 0.08,
      ease: "easeOut",
    },
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// LOADING ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Skeleton shimmer — for loading placeholders. */
export const skeletonShimmer: Variants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/** Spinner rotate — continuous rotation. */
export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/** Three-dot bounce — for "waiting" states. */
export const dotBounce: Variants = {
  animate: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15,
      ease: "easeInOut",
    },
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSITE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a staggered list animation config.
 * @param index - The item's index in the list
 * @param baseDelay - Base delay before staggering starts (seconds)
 * @param perItemDelay - Delay between each item (seconds)
 */
export function staggeredDelay(
  index: number,
  baseDelay = 0.1,
  perItemDelay = 0.05,
): number {
  return baseDelay + index * perItemDelay;
}

/**
 * Returns animation props for a staggered list item.
 * Usage: <motion.div {...staggerItem(0)}>Item 1</motion.div>
 */
export function staggerItem(index: number) {
  return {
    variants: listItem,
    initial: "hidden",
    animate: "visible",
    custom: index,
    transition: {
      ...springGentle,
      delay: staggeredDelay(index),
    },
  };
}

/**
 * Creates a "pop in" animation config for celebratory reveals.
 * Larger elements get a bigger bounce.
 */
export function popIn(delay = 0): Variants {
  return {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        ...springBouncy,
        delay,
      },
    },
  };
}