import { SvelteComponentDev } from "svelte/internal";

export interface SmoothModalOptions {
  modalComponent: string | SvelteComponentDev;
  modalProps?: Record<string, any>;
  canDismissOnBackdrop?: boolean;
  canDismissOnEscapeKey?: boolean;
  canDismissOnEnterKey?: boolean;
}

export interface InternalSmoothModalOptions extends SmoothModalOptions {
  id: number;
}
