export * from "./SmoothModal/SmoothModalOptions";
export * from "./helpers/animations";
export * from "./helpers/dispatchModalAction";
export * from "./helpers/trapFocus";
export * from "./helpers/insertCustomElement";
export * from "./helpers/insertDynamicComponent";
export * from "./helpers/slotNameFromId";

// base web-components
import "./components/core/smooth-modal-backdrop.wc.svelte";
import "./components/core/smooth-modal-window.wc.svelte";
import "./components/core/smooth-modal-footer.wc.svelte";
import "./components/core/smooth-modal-button.wc.svelte";
import "./components/predefined-modals/smooth-modal-alert.wc.svelte";
import "./components/predefined-modals/smooth-modal-confirm.wc.svelte";

export { default as SmoothModalRoot } from "./components/core/SmoothModalRoot.svelte";

export * from "./SmoothModal/SmoothModal";
