import { expect, test, type Page, type Locator } from '@playwright/test';

const expectCssClassSizing = async (page: Page, alert: Locator, width: () => Promise<number>, expected: number) => {
  await page.addStyleTag({
    content: 'ion-alert.tablet-review-width { --width: 400px; } ion-alert.tablet-review-max { --max-width: 400px; }',
  });
  for (const name of ['tablet-review-width', 'tablet-review-max']) {
    await alert.evaluate((element, name) => element.classList.add(name), name);
    await expect.poll(async () => Math.abs((await width()) - 400)).toBeLessThanOrEqual(1);
    await alert.evaluate((element, name) => element.classList.remove(name), name);
    await expect.poll(async () => Math.abs((await width()) - expected)).toBeLessThanOrEqual(1);
  }
};

for (const viewport of [
  { width: 800, height: 1280 },
  { width: 1280, height: 800 },
]) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${viewport.width}x${viewport.height} ${mode}: Settings alert proportions preserve public sizing overrides`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(() => ((window as any).IONIC_E2E_TESTING = true));
      await page.goto('/main/index/alert?type=preferred');
      await page.evaluate((dark) => document.documentElement.classList.toggle('ion-palette-dark', dark), mode === 'dark');
      const alert = page.locator('ion-alert');
      const wrapper = alert.locator('.alert-wrapper');
      await expect(wrapper).toBeVisible();
      const width = async () => (await wrapper.boundingBox())!.width;
      const expected = viewport.width * (viewport.width > viewport.height ? 0.65 : 0.85);
      await expect.poll(async () => Math.abs((await width()) - expected)).toBeLessThanOrEqual(1);
      const rect = (await wrapper.boundingBox())!;
      expect(Math.abs(rect.x - (viewport.width - expected) / 2)).toBeLessThanOrEqual(1);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height);
      for (const name of ['Details', 'Continue', 'Cancel']) {
        await expect(alert.getByRole('button', { name, exact: true })).toBeInViewport();
      }
      await alert.evaluate((element) => (element as HTMLElement).style.setProperty('--max-width', '400px'));
      await expect.poll(async () => Math.abs((await width()) - 400)).toBeLessThanOrEqual(1);
      await alert.evaluate((element) => (element as HTMLElement).style.removeProperty('--max-width'));
      await expect.poll(async () => Math.abs((await width()) - expected)).toBeLessThanOrEqual(1);
      await alert.evaluate((element) => (element as HTMLElement).style.setProperty('--width', '400px'));
      await expect.poll(async () => Math.abs((await width()) - 400)).toBeLessThanOrEqual(1);
      await alert.evaluate((element) => (element as HTMLElement).style.removeProperty('--width'));
      await expect.poll(async () => Math.abs((await width()) - expected)).toBeLessThanOrEqual(1);
      await expectCssClassSizing(page, alert, width, expected);
      await alert.evaluate((element) => element.classList.add('md3-disabled'));
      expect(await alert.evaluate((element) => getComputedStyle(element).getPropertyValue('--width').trim())).toBe('auto');
      await alert.evaluate((element) => element.classList.remove('md3-disabled'));
      await expect.poll(async () => Math.abs((await width()) - expected)).toBeLessThanOrEqual(1);
      await alert.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(page.locator('ion-alert')).toHaveCount(0);
    });
  }
}

for (const viewport of [
  { width: 411, height: 891 },
  { width: 891, height: 411 },
  { width: 767, height: 1024 },
  { width: 1280, height: 599 },
]) {
  test(`${viewport.width}x${viewport.height}: compact windows retain content-sized Ionic alerts`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => ((window as any).IONIC_E2E_TESTING = true));
    await page.goto('/main/index/alert?type=preferred');
    const alert = page.locator('ion-alert');
    await expect(alert).toBeVisible();
    expect(await alert.evaluate((element) => getComputedStyle(element).getPropertyValue('--width').trim())).toBe('auto');
    const box = (await alert.locator('.alert-wrapper').boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.width).toBeLessThanOrEqual(560);
  });
}

for (const screen of [
  { width: 800, height: 1280 },
  { width: 1280, height: 800 },
  { width: 1024, height: 1366 },
]) {
  test(`${screen.width}x${screen.height}: Android tablet sizing survives IME and rotation`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: screen,
      screen,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 17; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    });
    try {
      const page = await context.newPage();
      await page.addInitScript(() => ((window as any).IONIC_E2E_TESTING = true));
      await page.goto('/main/index/alert?type=preferred');
      await expect(page.locator('html')).toHaveClass(/plt-android/);
      const alert = page.locator('ion-alert'),
        wrapper = alert.locator('.alert-wrapper');
      const width = async () => (await wrapper.boundingBox())!.width;
      const expected = screen.width * (screen.width > screen.height ? 0.65 : 0.85);
      await expect.poll(async () => Math.abs((await width()) - expected)).toBeLessThanOrEqual(1);
      const cdp = await context.newCDPSession(page);
      // Keep CSS screen dimensions unchanged, as a native adjustResize IME does.
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: screen.width,
        height: screen.height - 376,
        deviceScaleFactor: 1,
        mobile: false,
        screenWidth: screen.width,
        screenHeight: screen.height,
      });
      expect(await page.evaluate(() => ({ width: window.screen.width, height: window.screen.height }))).toEqual(screen);
      await expect.poll(async () => Math.abs((await width()) - expected)).toBeLessThanOrEqual(1);
      for (const property of ['--width', '--max-width']) {
        await alert.evaluate((element, property) => (element as HTMLElement).style.setProperty(property, '400px'), property);
        await expect.poll(async () => Math.abs((await width()) - 400)).toBeLessThanOrEqual(1);
        await alert.evaluate((element, property) => (element as HTMLElement).style.removeProperty(property), property);
      }
      await expectCssClassSizing(page, alert, width, expected);
      const rotated = { width: screen.height, height: screen.width };
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        ...rotated,
        deviceScaleFactor: 1,
        mobile: false,
        screenWidth: rotated.width,
        screenHeight: rotated.height,
      });
      const rotatedExpected = rotated.width * (rotated.width > rotated.height ? 0.65 : 0.85);
      await expect.poll(async () => Math.abs((await width()) - rotatedExpected)).toBeLessThanOrEqual(1);
      await expectCssClassSizing(page, alert, width, rotatedExpected);
      await alert.evaluate((element) => element.classList.add('md3-disabled'));
      expect(await alert.evaluate((element) => getComputedStyle(element).getPropertyValue('--width').trim())).toBe('auto');
    } finally {
      await context.close();
    }
  });
}

for (const screen of [
  { width: 411, height: 891 },
  { width: 891, height: 411 },
]) {
  test(`${screen.width}x${screen.height}: Android phone does not inherit tablet sizing`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: screen,
      screen,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 17; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    });
    try {
      const page = await context.newPage();
      await page.goto('/main/index/alert?type=preferred');
      const alert = page.locator('ion-alert');
      await expect(alert).toBeVisible();
      expect(await alert.evaluate((element) => getComputedStyle(element).getPropertyValue('--width').trim())).toBe('auto');
    } finally {
      await context.close();
    }
  });
}
