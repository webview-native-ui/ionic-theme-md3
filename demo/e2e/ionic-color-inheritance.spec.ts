import { expect, test } from '@playwright/test';

for (const mode of ['light', 'dark'] as const) {
  for (const width of [411, 1280]) {
    test(`${mode} ${width}px: Ionic defaults, dedicated colors and partial Material roles`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 411 ? 891 : 800 });
      await page.emulateMedia({ colorScheme: mode });
      await page.goto('/main/index/color-palette');
      await expect(page.getByTestId('palette-card')).toHaveClass(/hydrated/);
      const result = await page.evaluate(async () => {
        const fixture = document.createElement('section');
        fixture.style.cssText =
          '--ion-background-color:#123456;--ion-text-color:#fedcba;--ion-color-primary:#008040;--ion-color-primary-contrast:#fff';
        document.body.append(fixture);
        const components = [
          ['ion-card', '--background', '--color'],
          ['ion-toolbar', '--background', '--color'],
          ['ion-item', '--background', '--color'],
          ['ion-tab-bar', '--background', '--color', '--color-selected'],
          ['ion-menu', '--background'],
          ['ion-content', '--background'],
          ['ion-fab-button', '--background', '--color'],
          ['ion-chip', '--background', '--color'],
        ];
        const sample = (element: Element, property: string) => {
          const swatch = document.createElement('span');
          swatch.style.color = `var(${property})`;
          element.append(swatch);
          const color = getComputedStyle(swatch).color;
          swatch.remove();
          return color;
        };
        const records = [];
        for (const [tag, ...properties] of components) {
          const themed = document.createElement(tag) as HTMLElement & { componentOnReady(): Promise<unknown> };
          themed.setAttribute('mode', 'md');
          const baseline = themed.cloneNode() as typeof themed;
          baseline.classList.add('md3-disabled');
          if (tag === 'ion-fab-button') {
            const fab = document.createElement('ion-fab');
            fab.setAttribute('mode', 'md');
            fixture.append(fab);
            fab.append(themed, baseline);
          } else {
            fixture.append(themed, baseline);
          }
          await customElements.whenDefined(tag);
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
          if (!themed.shadowRoot || !baseline.shadowRoot) throw new Error(`Unhydrated fixture: ${tag}`);
          records.push({ tag, themed: properties.map((p) => sample(themed, p)), baseline: properties.map((p) => sample(baseline, p)) });
        }
        const card = fixture.querySelector('ion-card') as HTMLElement;
        fixture.style.setProperty('--md-sys-color-surface-container-low', '#abcdef');
        const materialCard = sample(card, '--background');
        const unchangedToolbar = sample(fixture.querySelector('ion-toolbar')!, '--background');
        fixture.style.setProperty('--ion-card-background', '#654321');
        fixture.style.removeProperty('--md-sys-color-surface-container-low');
        const dedicatedCard = sample(card, '--background');
        const customStyle = document.createElement('style');
        customStyle.textContent = 'ion-card.inheritance-custom { --background: #ff0080; }';
        fixture.append(customStyle);
        card.classList.add('inheritance-custom');
        const localCard = sample(card, '--background');
        fixture.remove();
        return { records, materialCard, unchangedToolbar, dedicatedCard, localCard };
      });
      for (const record of result.records) expect(record.themed, record.tag).toEqual(record.baseline);
      expect(result.materialCard).toBe('rgb(171, 205, 239)');
      expect(result.unchangedToolbar).toBe(result.records.find((record) => record.tag === 'ion-toolbar')!.baseline[0]);
      expect(result.dedicatedCard).toBe('rgb(101, 67, 33)');
      expect(result.localCard).toBe('rgb(255, 0, 128)');
      await page.screenshot({ path: `/tmp/md3-ionic-colors-${mode}-${width}.png`, fullPage: true });
      await page.getByTestId('toggle-roles').click();
      await page.screenshot({ path: `/tmp/md3-material-colors-${mode}-${width}.png`, fullPage: true });
    });
  }
}
