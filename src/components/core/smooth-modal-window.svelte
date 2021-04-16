<svelte:options tag="smooth-modal-window" />

<script lang="ts">
  import { dispatchModalAction } from '@smooth-modal';

  let rootElement;

  // function handleKeyDown(event: KeyboardEvent) {
  //   console.log(event.key);
  //   if (event.key === 'Enter') {
  //     event.stopPropagation();
  //     event.preventDefault();
  //     dispatchModalAction(rootElement, 'confirm');
  //   }
  // }
</script>

<div bind:this={rootElement} class="smooth-modal" on:click>
  <div class="header">
    <slot name="header" />
  </div>

  <div class="body">
    <slot />
  </div>

  <div class="footer">
    <slot name="footer" />
  </div>
</div>

<style type="text/scss">
  * {
    box-sizing: border-box;
  }

  .smooth-modal {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    max-height: 100%;
    background-color: white;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.2));
    min-width: min(200px, 50vw);
    border-radius: var(--border-radius, 0);
    overflow: hidden;
    & > * {
      min-height: 0;
      overflow-x: auto;
    }
  }
</style>
