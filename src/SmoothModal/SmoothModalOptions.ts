import { SvelteComponentDev } from "svelte/internal";

export interface SmoothModalOptions {
  modalComponent: string | SvelteComponentDev;
  modalProps?: Record<string, any>;
}

export interface InternalSmoothModalOptions extends SmoothModalOptions {
  id: number;
}
