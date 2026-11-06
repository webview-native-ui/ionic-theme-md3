import { expect, test, type Page } from '@playwright/test';

const waitForStableLayout = async (page: Page) => {
  await page.evaluate(async () => {
    await document.fonts.ready;
    let previous = '';
    let stable = 0;
    for (let frame = 0; frame < 120; frame++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const geometry = JSON.stringify(
        [
          ...document.querySelectorAll(
            'ion-alert .alert-wrapper, ion-alert button, ion-alert .alert-radio-icon, ion-alert .alert-radio-label',
          ),
        ].map((element) => {
          const box = element.getBoundingClientRect();
          return [box.x, box.y, box.width, box.height];
        }),
      );
      const running = document.getAnimations().some((animation) => animation.playState === 'running');
      stable = geometry === previous && !running ? stable + 1 : 0;
      previous = geometry;
      if (stable >= 3) return;
    }
    throw new Error('Alert layout did not settle');
  });
};

const openAlert = async (page: Page, mode: 'light' | 'dark', route: string) => {
  await page.addInitScript(() => {
    const state = window as Window & { IONIC_E2E_TESTING?: boolean; alertPresented?: boolean };
    state.IONIC_E2E_TESTING = true;
    document.addEventListener('ionAlertDidPresent', () => (state.alertPresented = true), { once: true });
  });
  await page.emulateMedia({ colorScheme: mode });
  await page.goto(route);
  // E2E disables the dynamic-color startup, so choose the class palette explicitly.
  await page.evaluate((mode) => document.documentElement.classList.toggle('ion-palette-dark', mode === 'dark'), mode);
  const alert = page.locator('ion-alert');
  await expect(alert).toBeVisible();
  await page.waitForFunction(() => (window as Window & { alertPresented?: boolean }).alertPresented === true);
  await waitForStableLayout(page);
  return alert;
};

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: stacked alert action labels stay centered`, async ({ page }) => {
    const alert = await openAlert(page, mode, '/main/index/alert?type=remove-app');
    const actions = alert.locator('.alert-button');
    await expect(actions).toHaveCount(3);
    // Measure the rendered text, not its full-width flex wrapper. The previous
    // right alignment was most apparent on the full-width stacked actions.
    await expect
      .poll(() =>
        actions.evaluateAll((buttons) =>
          Math.max(
            ...buttons.map((button) => {
              const label = button.querySelector('.alert-button-inner')!;
              const range = document.createRange();
              range.selectNodeContents(label);
              const text = range.getBoundingClientRect();
              const bounds = button.getBoundingClientRect();
              return Math.abs(text.x + text.width / 2 - (bounds.x + bounds.width / 2));
            }),
          ),
        ),
      )
      .toBeLessThanOrEqual(1);
  });

  test(`${mode}: alert radio choices retain Ionic column alignment`, async ({ page }) => {
    const alert = await openAlert(page, mode, '/main/index/select?type=alert');
    const options = alert.locator('.alert-radio-button');
    await expect(options).toHaveCount(3);
    const positions = () =>
      options.evaluateAll((buttons) =>
        buttons.map((button) => {
          const bounds = button.getBoundingClientRect();
          const icon = button.querySelector('.alert-radio-icon')!.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(button.querySelector('.alert-radio-label')!);
          return { icon: icon.x - bounds.x, text: range.getBoundingClientRect().x - bounds.x };
        }),
      );
    const themed = await positions();
    // Ionic's actual unthemed layout is the reference, in both supported majors.
    // Centering all .alert-button-inner elements moves the radio columns too.
    await alert.evaluate((element) => element.classList.add('md3-disabled'));
    await waitForStableLayout(page);
    const ionic = await positions();
    themed.forEach((position, index) => {
      expect(Math.abs(position.icon - ionic[index].icon)).toBeLessThanOrEqual(1);
      expect(Math.abs(position.text - ionic[index].text)).toBeLessThanOrEqual(1);
    });
    expect(Math.max(...themed.map((p) => p.icon)) - Math.min(...themed.map((p) => p.icon))).toBeLessThanOrEqual(1);
    expect(Math.max(...themed.map((p) => p.text)) - Math.min(...themed.map((p) => p.text))).toBeLessThanOrEqual(1);
  });
}
