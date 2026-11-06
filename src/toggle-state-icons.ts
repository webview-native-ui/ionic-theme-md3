const stateIcons = `
:host(.md:not(.md3-disabled)) [part~="handle"]:empty::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--md3-toggle-state-icon-color, var(--ion-color-primary, #0054e9));
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='m3 3 6 6m0-6-6 6' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E") center / contain no-repeat;
}
:host(.md.toggle-checked:not(.md3-disabled)) [part~="handle"]:empty::before {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='m2 6 3 3 5-6' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
}
`;

/**
 * Add Android Settings state icons to one Ionic toggle.
 * Ionic's enableOnOffLabels property takes priority, including subsequent changes.
 * Uses the public handle Part without observing or intercepting component properties.
 * Returns a function that removes this enhancement.
 */
export async function applyToggleStateIcons(toggle: HTMLElement): Promise<() => void> {
  if (toggle.localName !== 'ion-toggle') throw new TypeError('Expected an ion-toggle element');
  await toggle.ownerDocument.defaultView?.customElements.whenDefined('ion-toggle');
  await (toggle as HTMLElement & { componentOnReady?: () => Promise<unknown> }).componentOnReady?.();
  const root = toggle.shadowRoot;
  if (!root) throw new Error('The Ionic toggle must have rendered its Shadow DOM');
  if (root.querySelector('style[data-md3-state-icons]')) return () => {};
  const style = toggle.ownerDocument.createElement('style');
  style.dataset['md3StateIcons'] = '';
  style.textContent = stateIcons;
  root.append(style);
  return () => style.remove();
}
