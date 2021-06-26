
export function dispatchModalAction(
  rootElement: HTMLElement,
  action: string,
  payload?: any,
) {
  const event = new CustomEvent('action', {
    detail: { action, payload },
    composed: true,
    bubbles: true,
  });

  rootElement.dispatchEvent(event);
}