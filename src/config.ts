import type { IonicConfig } from '@ionic/core/components';
import { mdTransitionAnimation } from './transition/md.transition';

/** Spread MD3 defaults into your framework's Ionic initialization options. */
export const md3ThemeConfig: IonicConfig = {
  mode: 'md',
  navAnimation: mdTransitionAnimation,
};
