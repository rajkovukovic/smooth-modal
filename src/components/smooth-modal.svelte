<svelte:options tag="smooth-modal" />

<script lang="ts">
  import { SmoothModal } from '@smooth-modal';

  export let message = 'no message';
</script>

<div
  class="smooth-modal"
  on:click={() => SmoothModal.alert(Math.round(Math.random() * 1000))}
>
  {message}
</div>

<style type="text/scss">
  * {
    box-sizing: border-box;
  }

  .smooth-modal {
    padding: 100px;
    background-color: white;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.2));
  }
</style>
