import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { applyToggleStateIcons } from '../../../../../../src/toggle-state-icons';

@Directive({ selector: 'ion-toggle[md3StateIcons]' })
export class ToggleStateIconsDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      void applyToggleStateIcons(element).then((remove) => {
        if (destroyRef.destroyed) remove();
        else destroyRef.onDestroy(remove);
      });
    });
  }
}
