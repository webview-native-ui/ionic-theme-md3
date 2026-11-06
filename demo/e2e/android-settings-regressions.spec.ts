import { expect, test } from '@playwright/test';

for (const type of ['normal', 'card', 'sheet']) {
  test(`modal ${type}: one overlay throughout its lifecycle`, async ({ page }) => {
    await page.goto(`/main/index/modal?type=${type}`);
    await expect(page.locator('ion-modal.show-modal')).toHaveCount(1);
    const maximum = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let maximum = document.querySelectorAll('ion-modal').length;
          const observer = new MutationObserver(() => {
            maximum = Math.max(maximum, document.querySelectorAll('ion-modal').length);
          });
          observer.observe(document.body, { childList: true, subtree: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(maximum);
          }, 1200);
        }),
    );
    expect(maximum).toBe(1);
    await page.locator('ion-modal app-modal ion-buttons[slot="start"] ion-button').click();
    await expect(page.locator('ion-modal')).toHaveCount(0);
  });
}

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: wrapped text, accordion slots and public back-button background`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.setViewportSize({ width: 411, height: 900 });
    await page.goto('/main/index/item-list');
    const label = page.locator('app-item-list ion-list.list-inset').nth(2).locator('ion-item').last().locator('ion-label');
    const metrics = await label.evaluate((element) => {
      const s = getComputedStyle(element);
      return { size: parseFloat(s.fontSize), line: parseFloat(s.lineHeight) };
    });
    expect(metrics.line).toBeGreaterThanOrEqual(metrics.size * 1.2);
    const back = page.locator('app-item-list > ion-header ion-back-button');
    await back.evaluate((element) => (element as HTMLElement).style.setProperty('--background', '#ff0000'));
    expect(await back.evaluate((element) => getComputedStyle(element.shadowRoot!.querySelector('[part="native"]')!).backgroundColor)).toBe(
      'rgb(255, 0, 0)',
    );
    await page.goto('/main/index/accordion');
    const accordions = page.locator('app-accordion ion-accordion');
    await expect(accordions.first()).toHaveClass(/hydrated/);
    expect(await accordions.first().evaluate((element) => getComputedStyle(element).marginBottom)).toBe('2px');
    expect(await accordions.last().evaluate((element) => getComputedStyle(element).marginBottom)).toBe('0px');
    await accordions.first().locator('ion-item[slot="header"]').click();
    await expect(accordions.first()).toHaveClass(/accordion-expanded/);
    await expect(accordions.first().locator('[slot="content"]')).toBeVisible();
    expect(await accordions.first().evaluate((element) => getComputedStyle(element).marginBottom)).toBe('2px');
  });

  test(`${mode}: Ionic label properties take priority over optional icons`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/main/index/toggle');
    const toggle = page.locator('app-toggle ion-toggle').first();
    const icons = () =>
      toggle.evaluate((element) => {
        const h = element.shadowRoot!.querySelector('[part="handle"]')!;
        const s = getComputedStyle(h, '::before');
        return { count: h.querySelectorAll('ion-icon').length, content: s.content, mask: s.maskImage };
      });
    await expect.poll(async () => (await icons()).mask).toContain('svg');
    await toggle.evaluate((element) => ((element as HTMLIonToggleElement).enableOnOffLabels = true));
    await expect.poll(async () => (await icons()).count).toBe(1);
    await expect.poll(async () => (await icons()).content).toBe('none');
    await toggle.evaluate((element) => ((element as HTMLIonToggleElement).checked = true));
    await expect(toggle).toHaveClass(/toggle-checked/);
    expect((await icons()).content).toBe('none');
    await toggle.evaluate((element) => ((element as HTMLIonToggleElement).enableOnOffLabels = false));
    await expect.poll(async () => (await icons()).mask).toContain('svg');
    await toggle.evaluate((element) => element.classList.add('md3-disabled'));
    expect((await icons()).content).toBe('none');
  });

  test(`${mode}: range cutout follows its Ionic container`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/main/index/range');
    const range = page.locator('app-range ion-range').nth(3);
    await expect(range).toHaveClass(/hydrated/);
    await range.evaluate((element) => {
      (element as HTMLIonRangeElement).value = 50;
      element.closest('ion-item')!.style.setProperty('--background', '#345678');
    });
    await expect(range).not.toHaveClass(/range-value-min/);
    const outline = () => range.evaluate((element) => getComputedStyle(element.shadowRoot!.querySelector('[part="knob"]')!).outlineColor);
    await expect.poll(outline).toBe('rgb(52, 86, 120)');
    await range.evaluate((element) => element.closest('ion-item')!.setAttribute('color', 'danger'));
    await expect(range.locator('..')).toHaveClass(/ion-color-danger/);
    const expected = await range.evaluate((element) => {
      const span = document.createElement('span');
      span.style.color = 'var(--md3-surface-background)';
      element.append(span);
      const color = getComputedStyle(span).color;
      span.remove();
      return color;
    });
    await expect.poll(outline).toBe(expected);
    await range.evaluate((element) => (element as HTMLElement).style.setProperty('--md3-range-gap-color', '#abcdef'));
    await expect.poll(outline).toBe('rgb(171, 205, 239)');
  });
}

test('child FAB and tab opt-outs restore Ionic shapes', async ({ page }) => {
  await page.goto('/main/index/floating-action-button');
  const fab = page.locator('app-floating-action-button ion-fab-button').first();
  await expect(fab).toHaveClass(/hydrated/);
  const fabShape = await fab.evaluate((element) => {
    element.classList.add('md3-disabled');
    const read = () => getComputedStyle(element.shadowRoot!.querySelector('[part="native"]')!).borderRadius;
    const child = read();
    element.closest('ion-fab')!.classList.add('md3-disabled');
    return { child, ionic: read() };
  });
  expect(fabShape.child).toBe(fabShape.ionic);
  await page.goto('/main/index/tabs');
  const tab = page.locator('app-tabs ion-tab-button').first();
  await expect(tab).toHaveClass(/hydrated/);
  const tabShape = await tab.evaluate((element) => {
    element.classList.add('md3-disabled');
    const icon = element.querySelector('ion-icon')!;
    const read = () => ({
      padding: getComputedStyle(icon).padding,
      radius: getComputedStyle(icon).borderRadius,
      before: getComputedStyle(icon, '::before').content,
    });
    const child = read();
    element.closest('ion-tab-bar')!.classList.add('md3-disabled');
    return { child, ionic: read() };
  });
  expect(tabShape.child).toEqual(tabShape.ionic);
});

test('alert keeps cancellation and destructive roles with Settings shapes', async ({ page }) => {
  await page.goto('/main/index/alert?type=all');
  const alert = page.locator('ion-alert.show-alert');
  await expect(alert).toBeVisible();
  expect(await alert.locator('.alert-wrapper').evaluate((element) => getComputedStyle(element).borderRadius)).toBe('28px');
  const cancel = alert.locator('.alert-button-role-cancel');
  const destructive = alert.locator('.alert-button-role-destructive');
  expect(await cancel.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  expect(await destructive.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  await cancel.click();
  await expect(alert).toHaveCount(0);
});
