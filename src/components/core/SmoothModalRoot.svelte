<script lang="ts">
  import {
    fadeIn,
    fadeOut,
    InternalSmoothModalOptions,
    insertDynamicComponent,
    trapFocus,
    SmoothModalOptions,
  } from '@smooth-modal';

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
  <smooth-modal-backdrop>
    {#each modalStack as { modalComponent, modalProps, id }, index (id)}
      {#if modalsCount - index < maxVisible + 1}
        {#if typeof modalComponent === 'function' || typeof modalComponent === 'string'}
          <div
            slot="modal-stack"
            class="smooth-modal-transform-wrapper"
            style="
                grid-area: 1 / 1 / 1 / 1;
                display: flex;
                flex-direction: column;
                flex-wrap: nowrap;
                justify-content: flex-start;
                align-items: center;
                min-height: 0;
                max-height: fit-content;
                transform-style: preserve-3d;
                perspective-origin: 50% 0;
                pointer-events: {index <
            modalsCount - 1
              ? 'none'
              : 'auto'};
                transform: translate3d(0, {-20 *
              (modalsCount - index - 1)}px, {-200 *
              (modalsCount - index - 1)}px);
                filter: {index <
            modalsCount - 1
              ? 'brightness(50%)'
              : 'brightness(100%)'};"
            in:fadeIn={{ animateTransform: true }}
            out:fadeOut={{ animateTransform: true }}
          >
            <div
              class="smooth-modal-wrapper"
              on:action={tryDismissLast}
              on:click|stopPropagation
              style="
                  width: fit-content;
                  height: fit-content;
                  max-width: 100%;
                  max-height: 100%;
                  user-select: none;"
              use:insertDynamicComponent={{
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
      {/if}
    {/each}
  </smooth-modal-backdrop>
{/if}
