"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/components/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds to offset this element's entrance — use to stagger siblings. */
  delay?: number;
  as?: "div" | "section" | "li" | "span";
};

export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
