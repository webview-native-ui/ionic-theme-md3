import { test, expect } from '@playwright/test';
import { actionSheetTypes, alertTypes, loadingTypes, modalTypes, selectTypes, toastTypes } from '../src/app/overlay-types';
import type { Page } from 'playwright-core';
import deviceScheme from './fixtures/android17-device-colors.json';
import {
  expectDeviceColorPairs,
  expectDeviceColors,
  expectDeviceToggleColors,
  expectDeviceAlertFocusColors,
  mockDeviceColors,
  sendCompatibilityDeviceColors,
} from './device-colors';

/**
 * Screenshot tests for all routes defined in index.routes.ts
 *
 * This test suite captures full-page screenshots for each route
 * to ensure visual consistency across the application.
 */

interface IPath {
  path: string;
  name: string;
}

const typesPath = (path: IPath, types: string[]): IPath[] => {
  return types.map((type) => ({ path: `${path.path}?type=${type}`, name: `${path.name}:${type}` }));
};

const routes = [
  { path: '/main/index/color-palette', name: 'color-palette' },
  ...typesPath({ path: '/main/index/action-sheet', name: 'action-sheet' }, actionSheetTypes),
  ...typesPath({ path: '/main/index/alert', name: 'alert' }, alertTypes),
  { path: '/main/index/button', name: 'button' },
  { path: '/main/index/checkbox', name: 'checkbox' },
  { path: '/main/index/range', name: 'range' },
  ...typesPath({ path: '/main/index/toast', name: 'toast' }, toastTypes),
  { path: '/main/index/toggle', name: 'toggle' },
  { path: '/main/index/segment', name: 'segment' },
  ...typesPath({ path: '/main/index/modal', name: 'modal' }, modalTypes),
  { path: '/main/index/card', name: 'card' },
  { path: '/main/index/chip', name: 'chip' },
  { path: '/main/index/breadcrumbs', name: 'breadcrumbs' },
  { path: '/main/index/searchbar', name: 'searchbar' },
  { path: '/main/index/popover', name: 'popover' },
  ...typesPath({ path: '/main/index/progress-indicators', name: 'progress-indicators' }, loadingTypes),
  { path: '/main/index/floating-action-button', name: 'floating-action-button' },
  ...typesPath({ path: '/main/index/select', name: 'select' }, selectTypes),
  { path: '/main/index/radio', name: 'radio' },
  { path: '/main/index/date-and-time-pickers', name: 'date-and-time-pickers' },
  { path: '/main/index/accordion', name: 'accordion' },
  { path: '/main/index/inputs', name: 'inputs' },
  { path: '/main/index/item-list', name: 'item-list' },
  { path: '/main/index/reorder', name: 'reorder' },
  { path: '/main/index/tabs', name: 'tabs' },
  { path: '/main/index/toolbar', name: 'toolbar' },
].sort(() => Math.random() - 0.5);

const prepareScreenShot = async (page: Page, routeName: string) => {
  await expect(page.locator('ion-content[role="main"]')).toHaveClass(/hydrated/);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  if (routeName === 'alert:no-cancel' || routeName === 'alert:preferred') {
    // Initial autofocus can precede Ionic's focus-visible listener. Exercise a real keyboard state.
    const alert = page.locator('ion-alert:not(.overlay-hidden)');
    const focused = alert.locator(routeName === 'alert:no-cancel' ? '.alert-button-role-destructive' : '.alert-button-role-preferred');
    await expect(focused).toBeVisible();
    await alert.locator('.alert-wrapper').focus();
    await page.keyboard.press('Tab');
    if (routeName === 'alert:preferred') await page.keyboard.press('Tab');
    await expect(focused).toBeFocused();
    await expect(focused).toHaveClass(/ion-focused/);
  }
  if (!routeName.includes(':')) {
    const scrollHeight = await page.locator('ion-content[role="main"]').evaluate(async (el: any) => {
      const scrollEl = await el.getScrollElement();
      return scrollEl.scrollHeight;
    });
    await page.setViewportSize({ width: 1200, height: scrollHeight });
  }
};

test.describe('Screenshot Tests - All Routes', () => {
  for (const route of routes) {
    test(`should match screenshot for ${route.name}`, async ({ page }) => {
      // Set E2E testing flag to disable animations
      await page.addInitScript(() => ((window as any).IONIC_E2E_TESTING = true));
      await page.goto(route.path, { waitUntil: 'networkidle' });
      await prepareScreenShot(page, route.name);
      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('ion-spinner')],
      });
    });
  }
});

test.describe('Screenshot Tests - Dark Mode', () => {
  for (const route of routes) {
    test(`should match dark mode screenshot for ${route.name}`, async ({ page }) => {
      // Set E2E testing flag to disable animations
      await page.addInitScript(() => ((window as any).IONIC_E2E_TESTING = true));
      await page.goto(route.path, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        document.documentElement.classList.add('ion-palette-dark');
      });
      await prepareScreenShot(page, route.name);
      await expect(page).toHaveScreenshot(`${route.name}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('ion-spinner')],
      });
    });
  }
});

// Native bridge responses are fixed; conversion, role application and mode selection are real.
for (const mode of ['light', 'dark'] as const) {
  test.describe(`Screenshot Tests - Device colors ${mode}`, () => {
    for (const route of routes) {
      test(`should match device ${mode} screenshot for ${route.name}`, async ({ page }) => {
        await mockDeviceColors(page, mode);
        const manualOverlay = route.name === 'popover' || route.name.startsWith('select:') || route.name.startsWith('modal:');
        await page.goto(manualOverlay ? route.path.split('?')[0] : route.path, { waitUntil: 'networkidle' });
        await expectDeviceColors(page, mode);
        if (route.name === 'color-palette') await expectDeviceColorPairs(page, mode);
        if (route.name === 'toggle') await expectDeviceToggleColors(page, mode);
        if (route.name === 'popover') {
          await page.locator('#click-trigger-item').click();
          await expect(page.locator('ion-popover:not(.overlay-hidden) [part~=content]')).toBeVisible();
        } else if (route.name.startsWith('select:')) {
          const type = route.name.split(':')[1];
          const select = page.locator(`app-select ion-select.select-${type}`);
          await expect(select).toHaveJSProperty('interface', type);
          const presentEvents: Record<string, string> = {
            alert: 'ionAlertDidPresent',
            'action-sheet': 'ionActionSheetDidPresent',
            popover: 'ionPopoverDidPresent',
            modal: 'ionModalDidPresent',
          };
          await Promise.all([
            page.evaluate(
              (eventName) =>
                new Promise<void>((resolve) => {
                  document.addEventListener(eventName, () => resolve(), { once: true });
                }),
              presentEvents[type],
            ),
            select.click(),
          ]);
          await expect(page.locator(`ion-${type}:not(.overlay-hidden)`)).toBeVisible();
          if (type === 'alert') {
            // Capture an actual pointer-selected state, rather than version-specific initial dialog focus.
            const apple = page.locator('ion-alert').getByRole('radio', { name: 'Apple', exact: true });
            await apple.click();
            await expect(apple).toHaveAttribute('aria-checked', 'true');
          }
        } else if (route.name.startsWith('modal:')) {
          const type = route.name.split(':')[1];
          await page
            .locator('app-modal ion-item')
            .filter({ hasText: new RegExp(`^present:${type}$`) })
            .click();
          await expect(page.locator('ion-modal.show-modal [part~=content][role=dialog]')).toBeVisible();
        }
        await prepareScreenShot(page, route.name);
        if (route.name === 'alert:no-cancel' || route.name === 'alert:preferred')
          await expectDeviceAlertFocusColors(page, mode, route.name === 'alert:preferred');
        await expect(page).toHaveScreenshot(`device-${route.name}-${mode}.png`, {
          fullPage: true,
          animations: 'disabled',
          mask: [page.locator('ion-spinner')],
        });
      });
    }
  });
}

for (const mode of ['light', 'dark'] as const) {
  test(`should match device ${mode} screenshot after a six-role native update`, async ({ page }) => {
    await mockDeviceColors(page, mode);
    await page.goto('/main/index/color-palette', { waitUntil: 'networkidle' });
    await expectDeviceColors(page, mode);
    await expectDeviceColorPairs(page, mode);
    await sendCompatibilityDeviceColors(page, mode);
    await prepareScreenShot(page, 'color-palette');
    await expect(page).toHaveScreenshot(`device-compatibility-${mode}.png`, { fullPage: true, animations: 'disabled' });
  });
}

for (const mode of ['light', 'dark'] as const) {
  test(`should match device ${mode} screenshot for an active range pin`, async ({ page }) => {
    await mockDeviceColors(page, mode);
    await page.goto('/main/index/range', { waitUntil: 'networkidle' });
    await expectDeviceColors(page, mode);
    const range = page.locator('app-range .section-example ion-range').first();
    await expect(range).toHaveClass(/hydrated/);
    await range.evaluate((element) => {
      const control = element as HTMLElement & { pin: boolean; value: number };
      control.pin = true;
      control.value = 50;
    });
    await range.scrollIntoViewIfNeeded();
    const knob = range.locator('[part~=knob]');
    const bounds = await knob.boundingBox();
    if (!bounds) throw new Error('Range knob is not rendered');
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2 + 20, bounds.y + bounds.height / 2, { steps: 5 });
    try {
      await expect(range).toHaveClass(/range-pressed/);
      const pin = range.locator('[part~=pin]');
      await expect(pin).toBeVisible();
      const rgb = (hex: string) => `rgb(${[1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')})`;
      await expect(pin).toHaveCSS('background-color', rgb(deviceScheme[mode].inverseSurface));
      await expect(pin).toHaveCSS('color', rgb(deviceScheme[mode].inverseOnSurface));
      await expect(range).toHaveScreenshot(`device-range-pin-${mode}.png`, { animations: 'disabled' });
    } finally {
      await page.mouse.up();
    }
  });
}
