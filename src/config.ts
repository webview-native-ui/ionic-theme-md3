import type { IonicConfig } from '@ionic/core/components';
import { mdTransitionAnimation } from './transition/md.transition';

/** Apply MD3 defaults before passing the result to your framework's Ionic initializer. */
export const md3ThemeConfig = (existing: IonicConfig = {}): IonicConfig => {
  const mode = existing.mode ?? 'md';
  return {
    ...(mode === 'md' ? { navAnimation: mdTransitionAnimation } : {}),
    ...existing,
    mode,
  };
};
