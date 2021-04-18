import { SvelteComponentDev } from "svelte/internal";
import { SmoothModalOptions, SmoothModalRoot } from "@smooth-modal";

class SmoothModalClass {
  protected _rootDomElement: HTMLElement = document.body;
  protected _modalRoot: SvelteComponentDev;

  constructor() {
    console.log({ SmoothModalRoot });
    this._modalRoot = new SmoothModalRoot({
      target: this._rootDomElement,
      props: {},
    });
  }

  get rootElement(): HTMLElement {
    return this._rootDomElement;
  }

  public alert(modalProps: Record<string, any>) {
    return this._modalRoot.showModal({
      modalComponent: "smooth-modal-alert",
      modalProps,
      canDismissOnEnterKey: true,
      canDismissOnEscapeKey: true,
    });
  }

  public confirm(modalProps: Record<string, any>) {
    return this._modalRoot.showModal({
      modalComponent: "smooth-modal-confirm",
      modalProps,
      canDismissOnEnterKey: true,
      canDismissOnEscapeKey: true,
    });
  }

  public showModal(options: SmoothModalOptions) {
    return this._modalRoot.showModal(options);
  }

  public dismissLast(): void {
    return this._modalRoot.dismissLast();
  }
}

export const SmoothModal = new SmoothModalClass();
