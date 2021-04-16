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

  public alert(modalProps: Record<string, any>): Promise<boolean> {
    return this._backdropInstance.showModal({
      modalComponent: "smooth-modal-alert",
      modalProps,
    } as SmoothModalOptions);
  }

  public dismissLast(): void {
    return this._backdropInstance.dismissLast();
  }
}

export const SmoothModal = new SmoothModalClass();
