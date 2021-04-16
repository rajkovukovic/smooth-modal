<svelte:options tag="smooth-modal-backdrop" />

<script lang="ts">
  import {
    fadeIn,
    fadeOut,
    insertCustomElement,
    InternalSmoothModalOptions,
    SmoothModalOptions,
    trapFocus,
  } from '@smooth-modal';
  import { afterUpdate } from 'svelte';

  let autoId = 1;

  export let maxVisible = 4;

  const removeModalById = (id: number) => {
    const index = modalStack.findIndex((modalOptions => modalOptions.id === id));
    if (index >= 0) {
      modalStack.splice(index, 1);
      modalStack = modalStack;
    }
  }

  export const showModal = (options: SmoothModalOptions) => {
    const id = autoId++;
    modalStack = [...modalStack, { ...options, id }];
    return {
      destroy: () => removeModalById(id),
    }
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

  function throwError(message: string) {
    throw new Error(message);
  }
</script>

{#if visibleState}
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
      {#each modalStack as { modalComponent, modalProps, id }, index (id)}
        {#if typeof modalComponent === 'function'}
          <div class="smooth-modal-wrapper">
            <div class="smooth-modal-transform-wrapper">
              <svelte:component this={modalComponent} {...modalProps} />
            </div>
          </div>
        {:else if typeof modalComponent === 'string'}
          <div
            class="smooth-modal-transform-wrapper"
            class:disabled={index < modalsCount - 1}
            class:hidden={modalsCount - index >= maxVisible + 1}
            in:fadeIn={{ animateTransform: true }}
            out:fadeOut={{ animateTransform: true }}
            style="
              transform: translate3d(0, {-20 *
              (modalsCount - index - 1)}px, {-200 *
              (modalsCount - index - 1)}px);
              filter: {index <
            modalsCount - 1
              ? 'brightness(50%)'
              : 'brightness(100%)'};"
          >
            <div
              class="smooth-modal-wrapper"
              on:action={tryDismissLast}
              on:click|stopPropagation
              use:insertCustomElement={{
                tagName: modalComponent,
                props: modalProps,
                events: null,
              }}
              use:trapFocus={index === modalsCount - 1}
            />
          </div>
        {:else}
          {throwError(
            `modalComponent must be of type "SvelteComponent" or "string", got "${typeof modalComponent}" instead.`
          )}
        {/if}
      {/each}
    </div>
  </div>
{/if}

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

  .smooth-modal-wrapper {
    width: fit-content;
    height: fit-content;
    max-width: 100%;
    max-height: 100%;
    user-select: none;
  }
</style>
