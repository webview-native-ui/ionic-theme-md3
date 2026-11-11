import { expect, test } from '@playwright/test';

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: clicking a popover trigger presents its visible content`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/main/index/popover');
    await page.locator('html').evaluate((root, appearance) => {
      root.classList.toggle('ion-palette-dark', appearance === 'dark');
      root.style.colorScheme = appearance;
    }, mode);
    await expect(page.locator('html')).toHaveCSS('color-scheme', mode);
    await expect.poll(() => page.locator('html').evaluate((root) => root.classList.contains('ion-palette-dark'))).toBe(mode === 'dark');
    const trigger = page.locator('#click-trigger-item');
    await expect(trigger).toHaveClass(/hydrated/);
    await expect(page.locator('ion-popover:not(.overlay-hidden)')).toHaveCount(0);
    await trigger.click();

    const popover = page.locator('ion-popover:not(.overlay-hidden)');
    await expect(popover).toHaveCount(1);
    await expect(popover).toHaveAttribute('trigger', 'click-trigger-item');
    await expect(popover.locator('[part~="content"]')).toBeVisible();
    await expect(popover.locator('[part~="content"]')).toBeInViewport();
    await expect(popover.getByText('Hello World!', { exact: true })).toBeVisible();
    await expect(popover.getByText('Hello World!', { exact: true })).toBeInViewport();
  });

  test(`${mode}: clicking select presents the popover interface and its options`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    // Omit ?type so ionViewDidEnter does not race the user's click with an automatic open.
    await page.goto('/main/index/select');
    await page.locator('html').evaluate((root, appearance) => {
      root.classList.toggle('ion-palette-dark', appearance === 'dark');
      root.style.colorScheme = appearance;
    }, mode);
    await expect(page.locator('html')).toHaveCSS('color-scheme', mode);
    await expect.poll(() => page.locator('html').evaluate((root) => root.classList.contains('ion-palette-dark'))).toBe(mode === 'dark');
    const select = page.locator('app-select ion-select.select-popover');
    await expect(select).toHaveClass(/hydrated/);
    await expect(select).toHaveJSProperty('interface', 'popover');
    await expect(page.locator('ion-popover:not(.overlay-hidden)')).toHaveCount(0);
    await select.click();

    const popover = page.locator('ion-popover:not(.overlay-hidden)');
    await expect(popover).toHaveCount(1);
    await expect(popover.locator('[part~="content"]')).toBeVisible();
    await expect(popover.locator('[part~="content"]')).toBeInViewport();
    const options = popover.locator('ion-select-popover');
    await expect(options).toBeVisible();
    for (const fruit of ['Apple', 'Banana', 'Orange']) {
      await expect(options.getByText(fruit, { exact: true })).toBeVisible();
      await expect(options.getByText(fruit, { exact: true })).toBeInViewport();
    }
    await expect(page.locator('ion-alert.show-alert, ion-modal.show-modal, ion-action-sheet.show-action-sheet')).toHaveCount(0);
  });

  test(`${mode}: clicking sheet presents the modal body at its configured breakpoint`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    // Omit ?type so only this click creates the modal, including its nested ModalPage.
    await page.goto('/main/index/modal');
    await page.locator('html').evaluate((root, appearance) => {
      root.classList.toggle('ion-palette-dark', appearance === 'dark');
      root.style.colorScheme = appearance;
    }, mode);
    await expect(page.locator('html')).toHaveCSS('color-scheme', mode);
    await expect.poll(() => page.locator('html').evaluate((root) => root.classList.contains('ion-palette-dark'))).toBe(mode === 'dark');
    const trigger = page.locator('app-modal ion-item').filter({ hasText: /^present:sheet$/ });
    await expect(trigger).toHaveClass(/hydrated/);
    await expect(page.locator('ion-modal')).toHaveCount(0);
    await trigger.click();

    const modal = page.locator('ion-modal.show-modal');
    await expect(modal).toHaveCount(1);
    await expect(modal).toHaveClass(/modal-sheet/);
    await expect(modal).toHaveJSProperty('breakpoints', [0, 0.5, 0.8]);
    await expect.poll(() => modal.evaluate((element) => (element as HTMLIonModalElement).getCurrentBreakpoint())).toBe(0.8);
    await expect(modal.locator('[part~="content"][role="dialog"]')).toBeVisible();
    await expect(modal.locator('[part~="content"][role="dialog"]')).toBeInViewport();
    const title = modal.locator('app-modal > ion-header ion-title');
    await expect(title).toHaveText('modal');
    await expect(title).toBeInViewport();
    const body = modal.locator('app-modal ion-item').filter({ hasText: /^present:normal$/ });
    await expect(body).toBeVisible();
    await expect(body).toBeInViewport();
    await modal.locator('app-modal > ion-header ion-buttons[slot="start"] ion-button').click();
    await expect(page.locator('ion-modal')).toHaveCount(0);
  });
}
