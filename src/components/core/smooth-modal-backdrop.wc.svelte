<svelte:options tag="smooth-modal-backdrop" />

<script lang="ts">
  import {
    fadeIn,
    fadeOut,
    InternalSmoothModalOptions,
    slotNameFromId,
    SmoothModalOptions,
  } from '@smooth-modal';
  import { afterUpdate } from 'svelte';

  let autoId = 1;

  export let maxVisible = 4;

  const removeModalById = (id: number) => {
    const index = modalStack.findIndex(
      (modalOptions) => modalOptions.id === id
    );
    if (index >= 0) {
      modalStack.splice(index, 1);
      modalStack = modalStack;
    }
  };

  export const showModal = (options: SmoothModalOptions) => {
    const id = autoId++;
    modalStack = [...modalStack, { ...options, id }];
    return {
      destroy: () => removeModalById(id),
    };
  };

  export const dismissLast = () => {
    modalStack = modalStack.slice(0, -1);
  };

  export const dismissAll = () => {
    modalStack = [];
  };

  let modalStack: InternalSmoothModalOptions[] = [];
  let lastVisibleState = false;

  $: visibleState = modalStack.length > 0;
  $: modalsCount = modalStack.length;

  const tryDismissLast = (
    reason?: 'Enter' | 'Escape' | 'backdrop' | Event
  ): boolean => {
    if (modalsCount > 0) {
      const {
        modalProps,
        canDismissOnBackdrop,
        canDismissOnEscapeKey,
        canDismissOnEnterKey,
      } = modalStack[modalStack.length - 1];

      let stopDismiss = false;
      let response;
      if (reason instanceof CustomEvent) {
        response = reason.detail;
      } else if (
        (reason === 'backdrop' && canDismissOnBackdrop) ||
        (reason === 'Enter' && canDismissOnEnterKey) ||
        (reason === 'Escape' && canDismissOnEscapeKey)
      ) {
        response = { action: reason === 'Enter' ? 'confirm' : 'dismiss' };
      } else {
        stopDismiss = true;
      }

      if (response && typeof modalProps.onResponse === 'function') {
        stopDismiss = Boolean(modalProps.onResponse(response));
      }

      if (!stopDismiss) dismissLast();
      return !stopDismiss;
    }
  };

  $: if (lastVisibleState !== visibleState) {
    lastVisibleState = visibleState;
    if (visibleState) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'visible';
      document.removeEventListener('keydown', handleKeyDown);
    }
  }

  let backdropElement: HTMLDivElement;
  let modalStackElement: HTMLDivElement;
  let backdropHeight = 0;
  let modalStackHeight = 0;
  let backdropElementTransitions = false;

  afterUpdate(() => {
    if (backdropElement && modalStackElement) {
      if (backdropHeight !== backdropElement.clientHeight) {
        backdropHeight = backdropElement.clientHeight;
      }
      if (modalStackHeight !== modalStackElement.clientHeight) {
        modalStackHeight = modalStackElement.clientHeight;
      }
    }
  });

  $: if (backdropElement && modalStackElement) {
    modalStackElement.style.transform = `translateY(${
      (backdropHeight - modalStackHeight) / 2
    }px)`;

    if (!backdropElementTransitions) {
      backdropElementTransitions = true;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          modalStackElement.style.transition = 'transform 250ms ease-out';
        })
      );
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter') {
      if (tryDismissLast(event.key)) {
        event.stopPropagation();
        event.preventDefault();
      }
    }
  }
</script>

<div
  bind:clientHeight={backdropHeight}
  bind:this={backdropElement}
  class="smooth-modal-backdrop"
  in:fadeIn
  out:fadeOut
  on:click|stopPropagation={() => tryDismissLast('backdrop')}
>
  <div
    bind:clientHeight={modalStackHeight}
    bind:this={modalStackElement}
    class="modal-stack"
  >
    <slot name="modal-stack" />
  </div>
</div>

<style type="text/scss">
  * {
    box-sizing: border-box;
  }

  .smooth-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 10000;
  }

  .modal-stack {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    max-width: 100%;
    max-height: 90%;
    transform-style: preserve-3d;
    perspective-origin: 50% 0;
    perspective: 600px;
    @media (min-width: 480px) {
      max-width: 80%;
      max-height: 80%;
    }
  }

  .smooth-modal-transform-wrapper {
    grid-area: 1 / 1 / 1 / 1;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    min-height: 0;
    max-height: fit-content;
    &.disabled {
      pointer-events: none;
    }
    transform-style: preserve-3d;
    perspective-origin: 50% 0;
    &.hidden {
      display: none;
    }
  }
</style>
