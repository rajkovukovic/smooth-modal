<svelte:options tag="smooth-modal-backdrop" />

<script lang="ts">
  import { sineIn, sineOut } from 'svelte/easing';
  import {
    insertCustomElement,
    InternalSmoothModalOptions,
    SmoothModalOptions,
  } from '@smooth-modal';

  let autoId = 1;

  export const showModal = (options: SmoothModalOptions) => {
    modalStack = [...modalStack, { ...options, id: autoId++ }];
    const promise: any = new Promise((resolve, reject) => {});
    return promise;
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

  $: if (lastVisibleState !== visibleState) {
    lastVisibleState = visibleState;
    if (visibleState) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyPress, true);
    } else {
      document.body.style.overflow = 'visible';
      document.removeEventListener('keydown', handleKeyPress, true);
    }
    // TODO: disable document.body scroll
    // TODO: add ESC-key event listener
  }

  function fadeIn(node: HTMLElement, { duration = 300 }) {
    let didTick = false;
    return {
      duration,
      tick: (t) => {
        if (!didTick) {
          didTick = true;
          node.style.opacity = '0';
          const initialTransform = node.style.transform;
          node.style.transform = `translate3d(0, ${50}px, 0)`;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              node.style.opacity = '1';
              node.style.transform = initialTransform;
            })
          );
        }
      },
    };
  }

  function fadeOut(node: HTMLElement, { duration = 300 }) {
    let didTick = false;
    return {
      duration,
      tick: (t) => {
        if (!didTick) {
          didTick = true;
          node.classList.add('outro');
          node.style.opacity = '0';
          node.style.transform = `translate3d(0, ${200}px, 0)`;
        }
      },
    };
  }

  function handleKeyPress(event: KeyboardEvent) {
    console.log('handleKeyPress');
    if(event.key === "Escape") {
      event.stopPropagation();
      event.preventDefault();
      dismissLast();
    }
}

  function throwError(message: string) {
    throw new Error(message);
  }
</script>

{#if visibleState}
  <div class="smooth-modal-backdrop" on:click|stopPropagation={dismissLast}>
    <div class="modals-stack">
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
              on:click|stopPropagation
              in:fadeIn
              out:fadeOut
              style="
              transform: translate3d(0, {-50 *
                (modalsCount - index - 1)}px, {-200 *
                (modalsCount - index - 1)}px);
              filter: {index <
              modalsCount - 1
                ? 'brightness(0.6) grayscale(1)'
                : 'none'};"
              use:insertCustomElement={{
                tagName: modalComponent,
                props: modalProps,
                events: null,
              }}
            />
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
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 10000;
  }

  .modals-stack {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    max-width: 80%;
    max-height: 80%;
    transform-style: preserve-3d;
    perspective-origin: 50% 50%;
    perspective: 600px;
  }

  .smooth-modal-transform-wrapper {
    grid-area: 1 / 1 / 1 / 1;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    &.disabled {
      pointer-events: none;
    }
    transform-style: preserve-3d;
    perspective-origin: 50% 50%;
    transition: transform 200ms ease-in, opacity 200ms ease-in;
    &.outro {
      transition: transform 200ms ease-in, opacity 200ms ease-out;
    }
  }
</style>
