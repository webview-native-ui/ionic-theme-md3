import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import type { ToggleCustomEvent } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
  IonToggle,
} from '@demo/ionic';
import { demoColorMode, demoMaterialYou, setDemoColorMode, setDemoMaterialYou } from '../../theme/dynamic-colors';
import { ActivatedRoute, Router } from '@angular/router';

interface IComponent {
  name: string;
  enable: boolean;
}

@Component({
  selector: 'index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonToggle,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonItemGroup,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexPageComponent {
  readonly components = signal<IComponent[]>([
    { name: 'accordion', enable: true },
    { name: 'action-sheet', enable: true },
    { name: 'alert', enable: true },
    { name: 'breadcrumbs', enable: true },
    { name: 'button', enable: true },
    { name: 'card', enable: true },
    { name: 'checkbox', enable: true },
    { name: 'chip', enable: true },
    { name: 'color-palette', enable: true },
    { name: 'date-and-time-pickers', enable: true },
    { name: 'floating-action-button', enable: true },
    { name: 'inputs', enable: true },
    { name: 'item-list', enable: true },
    { name: 'modal', enable: true },
    { name: 'popover', enable: true },
    { name: 'progress-indicators', enable: true },
    { name: 'radio', enable: true },
    { name: 'range', enable: true },
    { name: 'reorder', enable: true },
    { name: 'searchbar', enable: true },
    { name: 'segment', enable: true },
    { name: 'select', enable: true },
    { name: 'tabs', enable: true },
    { name: 'toast', enable: true },
    { name: 'toggle', enable: true },
    { name: 'toolbar', enable: true },
  ]);
  readonly enableComponents = computed(() => this.components().filter((c) => c.enable));
  readonly disableComponents = computed(() => this.components().filter((c) => !c.enable));

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  async navigateComponent(item: IComponent) {
    await this.#router.navigate([item.name], { relativeTo: this.#route });
  }

  readonly colorMode = demoColorMode;

  readonly materialYou = demoMaterialYou;

  changeColorMode(event: ToggleCustomEvent) {
    setDemoColorMode(event.detail.checked ? 'dark' : 'light');
  }

  async changeMaterialYou(event: ToggleCustomEvent) {
    await setDemoMaterialYou(event.detail.checked);
  }
}
