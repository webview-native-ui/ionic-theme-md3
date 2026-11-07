import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@demo/ionic';

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.page.html',
  styleUrls: ['./color-palette.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonLabel,
    IonSearchbar,
    IonTitle,
    IonToolbar,
  ],
})
export class ColorPalettePage {
  readonly extraRoles = signal(false);
}
