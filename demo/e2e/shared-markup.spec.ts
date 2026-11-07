import { expect, test } from '@playwright/test';

for (const mode of ['light', 'dark'] as const) {
  for (const kind of ['alert', 'action-sheet'] as const) {
    test(`${mode}: ${kind} shares preferred semantics without changing ordinary actions`, async ({ page }) => {
      await page.addInitScript(() => ((window as any).IONIC_E2E_TESTING = true));
      await page.goto(`/main/index/${kind}?type=preferred`);
      await page.evaluate((dark) => document.documentElement.classList.toggle('ion-palette-dark', dark), mode === 'dark');
      const overlay = page.locator(`ion-${kind}`);
      await expect(overlay).toBeVisible();
      const preferred = overlay.getByRole('button', { name: 'Continue', exact: true });
      const ordinary = overlay.getByRole('button', { name: 'Details', exact: true });
      const paint = (locator: typeof preferred) =>
        locator.evaluate((element) => {
          const style = getComputedStyle(element);
          return { background: style.backgroundColor, color: style.color };
        });
      await expect.poll(async () => (await paint(preferred)).background).not.toBe('rgba(0, 0, 0, 0)');
      expect((await paint(preferred)).background).not.toBe((await paint(ordinary)).background);
      // Optional native roles refine the same semantic action without new markup.
      await overlay.evaluate((element) => {
        (element as HTMLElement).style.setProperty('--md-sys-color-primary', '#123456');
        (element as HTMLElement).style.setProperty('--md-sys-color-on-primary', '#ffffff');
      });
      await expect.poll(() => paint(preferred)).toEqual({ background: 'rgb(18, 52, 86)', color: 'rgb(255, 255, 255)' });
      await overlay.evaluate((element) => element.classList.add('md3-disabled'));
      await expect.poll(async () => (await paint(preferred)).background).not.toBe('rgb(18, 52, 86)');
      await overlay.evaluate((element) => element.classList.remove('md3-disabled'));
      await expect.poll(() => paint(preferred)).toEqual({ background: 'rgb(18, 52, 86)', color: 'rgb(255, 255, 255)' });
      // Role is reported by Ionic; visual emphasis must not invoke it automatically.
      await overlay.evaluate((element, kind) => {
        (window as any).sharedDismissal = undefined;
        element.addEventListener(
          kind === 'alert' ? 'ionAlertDidDismiss' : 'ionActionSheetDidDismiss',
          (event) => {
            (window as any).sharedDismissal = (event as CustomEvent).detail.role;
          },
          { once: true },
        );
      }, kind);
      expect(await page.evaluate(() => (window as any).sharedDismissal)).toBeUndefined();
      await preferred.click();
      await expect.poll(() => page.evaluate(() => (window as any).sharedDismissal)).toBe('preferred');
    });
  }
}
