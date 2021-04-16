
export function dispatchModalAction(
  rootElement: HTMLElement,
  action: string,
) {
  const event = new CustomEvent('action', {
    detail: { action },
    composed: true,
    bubbles: true,
  });

  rootElement.dispatchEvent(event);
}