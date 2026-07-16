"use client";

// Site-wide chat entry point: a fixed launcher that swaps for the panel.
// Charcoal, never gold (the gold accent is reserved for the booking CTA).
// On mobile the launcher sits above the sticky booking bar.

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChatCircleDots } from "@phosphor-icons/react";
import { ChatPanel } from "./chat-panel";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" as const };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            type="button"
            aria-label="Open chat"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            transition={transition}
            className="fixed right-4 bottom-24 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-canvas shadow-lg transition-colors duration-200 hover:bg-ink/85 md:right-6 md:bottom-6"
          >
            <ChatCircleDots size={24} aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            transition={transition}
            className="fixed inset-x-0 bottom-0 z-50 h-[85dvh] md:inset-x-auto md:right-6 md:bottom-6 md:h-[32rem] md:w-96"
          >
            <ChatPanel onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
