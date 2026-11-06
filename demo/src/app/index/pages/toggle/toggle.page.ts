import { Component, OnInit } from '@angular/core';

import { ToggleStateIconsDirective } from './toggle-state-icons.directive';

import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@demo/ionic';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.page.html',
  styleUrls: ['./toggle.page.scss'],
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
    IonListHeader,
    IonNote,
    IonText,
    IonToggle,
    ToggleStateIconsDirective,
  ],
})
export class TogglePage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
