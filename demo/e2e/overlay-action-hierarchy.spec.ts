import { expect, test } from '@playwright/test';
import type { ActionSheetButton } from '@ionic/core';
import { mockDeviceColors, expectDeviceColors } from './device-colors';

for (const width of [390, 1280]) {
  for (const mode of ['light', 'dark'] as const) {
    for (const native of [false, true]) {
      test(`${width}px ${mode} ${native ? 'device' : 'Ionic'}: recommended sheet actions remain list rows`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        if (native) await mockDeviceColors(page, mode);
        else await page.addInitScript(() => ((window as unknown as { IONIC_E2E_TESTING: boolean }).IONIC_E2E_TESTING = true));
        await page.goto('/main/index/action-sheet?type=preferred', { waitUntil: 'networkidle' });
        if (native) await expectDeviceColors(page, mode);
        else await page.locator('html').evaluate((element, dark) => element.classList.toggle('ion-palette-dark', dark), mode === 'dark');
        const sheet = page.locator('ion-action-sheet');
        const preferred = sheet.getByRole('button', { name: 'Continue', exact: true });
        const details = sheet.getByRole('button', { name: 'Details', exact: true });
        await expect(preferred).toBeVisible();
        const geometry = (button: typeof preferred) =>
          button.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            const text = document.createRange();
            text.selectNodeContents(element.querySelector('.action-sheet-button-inner')!);
            const style = getComputedStyle(element);
            return {
              x: bounds.x,
              width: bounds.width,
              height: bounds.height,
              textX: text.getBoundingClientRect().x,
              radius: style.borderRadius,
              background: style.backgroundColor,
            };
          });
        const ordinary = await geometry(details);
        const recommended = await geometry(preferred);
        expect(recommended).toEqual(ordinary);
        expect(recommended.height).toBeGreaterThanOrEqual(48);
        // Group spacing must remain inside the sheet surface, not reveal its backdrop.
        const surface = await sheet
          .locator('.action-sheet-group')
          .first()
          .evaluate((element) => getComputedStyle(element).backgroundColor);
        await expect(sheet.locator('.action-sheet-container')).toHaveCSS('background-color', surface);
        const cancelGroup = sheet.locator('.action-sheet-group-cancel');
        await expect(cancelGroup).toHaveCSS('border-top-width', '1px');
        await expect(cancelGroup).toHaveCSS('margin-top', '8px');
        await expect(cancelGroup).toHaveCSS('padding-top', '8px');
        await expect(sheet.getByRole('button', { name: 'Cancel', exact: true })).toBeInViewport();
        const primary = await sheet.evaluate((element) => {
          const style = getComputedStyle(element);
          return style.getPropertyValue('--md-sys-color-primary') || style.getPropertyValue('--ion-color-primary');
        });
        await preferred.focus();
        await expect(preferred).toBeFocused();
        // Public button options, including icons/disabled/selected, keep Ionic behavior.
        await sheet.evaluate((element) => {
          (element as HTMLElement & { buttons: ActionSheetButton[] }).buttons = [
            { text: 'Details', icon: 'information-circle-outline' },
            { text: 'Continue', icon: 'arrow-forward-outline', role: 'preferred' },
            { text: 'Delete', icon: 'trash-outline', role: 'destructive' },
            { text: 'Unavailable', role: 'preferred', disabled: true },
            { text: 'Selected', role: 'selected' },
            { text: 'Cancel', role: 'cancel' },
          ];
        });
        await expect(sheet.getByRole('button', { name: 'Unavailable', exact: true })).toBeDisabled();
        await expect(sheet.locator('.action-sheet-selected')).toHaveCSS('font-weight', '700');
        const icon = preferred.locator('ion-icon');
        await expect(icon).toBeVisible();
        expect(await icon.evaluate((element) => getComputedStyle(element).color)).toBe(
          await preferred.evaluate((element) => getComputedStyle(element).color),
        );
        const rgb = (hex: string) => `rgb(${[1, 3, 5].map((offset) => parseInt(hex.trim().slice(offset, offset + 2), 16)).join(', ')})`;
        await preferred.hover();
        await expect(preferred).toHaveCSS('color', rgb(primary));
        const destructive = sheet.getByRole('button', { name: 'Delete', exact: true });
        const error = await sheet.evaluate((element) => {
          const style = getComputedStyle(element);
          return style.getPropertyValue('--md-sys-color-error') || style.getPropertyValue('--ion-color-danger');
        });
        await destructive.hover();
        await expect(destructive).toHaveCSS('color', rgb(error));
        await destructive.focus();
        await expect(destructive).toHaveCSS('color', rgb(error));
        await expect(destructive.locator('ion-icon')).toHaveCSS('color', rgb(error));
        await sheet.evaluate((element) => {
          (window as unknown as { hierarchyRole?: string }).hierarchyRole = undefined;
          element.addEventListener('ionActionSheetDidDismiss', (event) => {
            (window as unknown as { hierarchyRole?: string }).hierarchyRole = (event as CustomEvent).detail.role;
          });
        });
        await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
        await expect.poll(() => page.evaluate(() => (window as unknown as { hierarchyRole?: string }).hierarchyRole)).toBe('cancel');
      });
    }
  }
}
