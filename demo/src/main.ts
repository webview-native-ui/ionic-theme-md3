import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { startDynamicColors } from './theme/dynamic-colors';

// Browser visual tests keep their existing explicit palette selection.
const start = async () => {
  if (!(window as unknown as { IONIC_E2E_TESTING?: boolean }).IONIC_E2E_TESTING) {
    await startDynamicColors().catch(console.error);
  }
  await bootstrapApplication(AppComponent, appConfig);
};
void start().catch(console.error);
