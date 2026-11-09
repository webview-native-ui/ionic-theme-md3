import { afterEach, expect, test, vi } from 'vitest';
import { applySettingsFont } from '../../../src/settings-font';

const originalRatio = window.devicePixelRatio;
const setRatio = (value: number) => Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value });

afterEach(() => {
  setRatio(originalRatio);
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
  document.documentElement.classList.remove('md3-settings-font');
});

test('uses one device pixel, updates only on DPR changes, and removes its resize listener', () => {
  const root = document.documentElement;
  setRatio(2.625);
  const writes = vi.spyOn(root.style, 'setProperty');
  const destroy = applySettingsFont(root);
  expect(root.classList.contains('md3-settings-font')).toBe(true);
  expect(parseFloat(root.style.getPropertyValue('--md3-device-pixel'))).toBeCloseTo(1 / 2.625);
  window.dispatchEvent(new Event('resize'));
  expect(writes).toHaveBeenCalledTimes(1);
  setRatio(2);
  window.dispatchEvent(new Event('resize'));
  expect(root.style.getPropertyValue('--md3-device-pixel')).toBe('0.5px');
  destroy();
  destroy();
  expect(root.classList.contains('md3-settings-font')).toBe(false);
  expect(root.style.getPropertyValue('--md3-device-pixel')).toBe('');
  writes.mockClear();
  setRatio(1);
  window.dispatchEvent(new Event('resize'));
  expect(writes).not.toHaveBeenCalled();
});

test('restores the application-owned class and CSS value', () => {
  const root = document.documentElement;
  root.classList.add('md3-settings-font');
  root.style.setProperty('--md3-device-pixel', '0.25px');
  const destroy = applySettingsFont(root);
  destroy();
  expect(root.classList.contains('md3-settings-font')).toBe(true);
  expect(root.style.getPropertyValue('--md3-device-pixel')).toBe('0.25px');
});
