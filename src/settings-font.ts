/**
 * Opt into the separately imported settings-font stylesheet. TextView rounds
 * dimensions to physical pixels; update its CSS unit only when DPR changes.
 * Call the returned cleanup when the owning view/application is destroyed.
 */
export function applySettingsFont(root: HTMLElement = document.documentElement): () => void {
  const view = root.ownerDocument.defaultView;
  if (!view) return () => {};
  const hadClass = root.classList.contains('md3-settings-font');
  const previous = root.style.getPropertyValue('--md3-device-pixel');
  const priority = root.style.getPropertyPriority('--md3-device-pixel');
  let ratio = 0;
  const update = () => {
    const next = view.devicePixelRatio || 1;
    if (next === ratio) return;
    ratio = next;
    root.style.setProperty('--md3-device-pixel', `${1 / ratio}px`);
  };
  update();
  root.classList.add('md3-settings-font');
  view.addEventListener('resize', update);
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    view.removeEventListener('resize', update);
    if (!hadClass) root.classList.remove('md3-settings-font');
    if (previous) root.style.setProperty('--md3-device-pixel', previous, priority);
    else root.style.removeProperty('--md3-device-pixel');
  };
}
