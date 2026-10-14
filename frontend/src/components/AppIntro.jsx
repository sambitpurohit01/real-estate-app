import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'keystone_intro_seen';

// A brief brand animation shown once per browser session (not on every route
// change) — plays while the very first page is still mounting underneath,
// then lifts away. Skips itself entirely on repeat visits within the session.
export default function AppIntro() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(SESSION_KEY);
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* ignore */ }
      setVisible(false);
    }, 1450);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="app-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
        >
          <div className="app-intro-grid" />
          <motion.div
            className="app-intro-mark"
            initial={{ opacity: 0, y: 14, letterSpacing: '0.02em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0em' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
              className="app-intro-keyline"
            />
            Keystone<span className="brand-mark">.</span>
          </motion.div>
          <motion.div
            className="app-intro-tag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Finding your foundation
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
