import { SmoothModalOptions } from "@smooth-modal";

class SmoothModalClass {
  protected _rootElement: HTMLElement = document.body;
  protected _backdropInstance: any;

  constructor() {
    this._backdropInstance = document.createElement('smooth-modal-backdrop') as any;
    this._rootElement.appendChild(this._backdropInstance);
  }

  get rootElement(): HTMLElement {
    return this._rootElement;
  }

  public alert(modalProps: Record<string, any>) {
    return this._backdropInstance.showModal({
      modalComponent: "smooth-modal-alert",
      modalProps,
      canDismissOnEnterKey: true,
      canDismissOnEscapeKey: true,
    });
  }

  public confirm(modalProps: Record<string, any>) {
    return this._backdropInstance.showModal({
      modalComponent: "smooth-modal-confirm",
      modalProps,
      canDismissOnEnterKey: true,
      canDismissOnEscapeKey: true,
    });
  }

  public showModal(options: SmoothModalOptions) {
    return this._backdropInstance.showModal(options);
  }

  public dismissLast(): void {
    return this._backdropInstance.dismissLast();
  }
}

export const SmoothModal = new SmoothModalClass();
