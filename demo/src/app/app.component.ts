import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { applySettingsFont } from '../../../src/settings-font';
import { IonApp, IonRouterOutlet } from '@demo/ionic';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

@Component({
  selector: 'app-root',
  imports: [IonRouterOutlet, IonApp],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor() {
    addIcons(allIcons);
    if (Capacitor.getPlatform() === 'android') {
      inject(DestroyRef).onDestroy(applySettingsFont());
    }
  }
}
