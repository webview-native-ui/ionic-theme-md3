import { Component, effect, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  AlertController,
  type AlertOptions,
  IonBackButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonText,
  IonTitle,
  IonToolbar,
} from '@demo/ionic';
import { alertUtil } from './alert.util';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { alertTypes } from '../../../overlay-types';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.page.html',
  styleUrls: ['./alert.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    FormsModule,
    IonBackButton,
    IonIcon,
    IonItem,
    IonItemGroup,
    IonLabel,
    IonList,
    IonText,
  ],
})
export class AlertPage implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #params = toSignal(this.#route.queryParams);
  readonly overlayCtrl = inject(AlertController);

  constructor() {
    effect(async () => {
      if (this.#params()?.['type']) {
        await this.present(this.#params()?.['type']);
      }
    });
  }

  ngOnInit() {}

  async present(type: (typeof alertTypes)[number]) {
    const applyConfig = ((type): AlertOptions => {
      if (type === 'checkbox' || type === 'radio') {
        return {
          header: 'Choose options',
          inputs: [
            { type, label: 'Apple', value: 'apple', checked: true },
            { type, label: 'Banana', value: 'banana' },
            { type, label: 'A longer option that wraps onto another line', value: 'orange' },
            { type, label: 'Unavailable', value: 'disabled', disabled: true },
          ],
          buttons: [
            { text: 'Cancel', role: 'cancel' },
            { text: 'OK', role: 'preferred' },
          ],
        };
      }
      if (type === 'input' || type === 'textarea') {
        return {
          header: type === 'input' ? 'Device name' : 'Description',
          inputs: [{ type: type === 'input' ? 'text' : 'textarea', value: type === 'input' ? 'Pixel 8a' : '', placeholder: 'Enter text' }],
          buttons: [
            { text: 'Cancel', role: 'cancel' },
            { text: 'OK', role: 'preferred' },
          ],
        };
      }
      if (type === 'preferred') {
        return {
          ...alertUtil(),
          buttons: [{ text: 'Details' }, { text: 'Continue', role: 'preferred' }, { text: 'Cancel', role: 'cancel' }],
        };
      } else if (type === 'button-only') {
        return {
          ...alertUtil(),
          header: undefined,
          subHeader: undefined,
        };
      } else if (type === 'no-cancel') {
        return {
          ...alertUtil(),
          buttons: alertUtil().buttons.filter((button) => button.role !== 'cancel'),
        };
      } else if (type === 'remove-app') {
        return {
          ...alertUtil(),
          header: 'Remove "odss"?',
          subHeader: undefined,
          message: 'Removing from Home Screen will keep the app in your App Library',
          buttons: [
            ...alertUtil().buttons,
            {
              text: 'Remove from Home Screen',
              role: 'confirm',
              handler: () => {
                console.log('Alert confirmed');
              },
            },
          ],
        };
      }
      return alertUtil();
    })(type);

    const actionSheet = await this.overlayCtrl.create(applyConfig);
    await actionSheet.present();
  }
}
