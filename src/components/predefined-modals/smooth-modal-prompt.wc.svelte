<svelte:options tag="smooth-modal-alert" />

<script lang="ts">
  import { dispatchModalAction } from '@smooth-modal';

  export let title: string = null;
  export let value: any = '';
  export let placeholder: any = '';
  export let input_type: string = 'text';
  export let ok_button_label: string = 'OK';
  export let onDismiss: Function = null;

  let rootElement: HTMLElement;
</script>

<smooth-modal-window bind:this={rootElement}>
  <h1 class="header" slot="header">
    {title || ''}
  </h1>

  <div class="body">
    <input type={input_type} {placeholder} {value} />
  </div>

  <smooth-modal-footer slot="footer">
    <!-- <smooth-modal-button>Cancel</smooth-modal-button> -->
    <smooth-modal-button
      default
      on:click={() => dispatchModalAction(rootElement, 'confirm')}
    >
      {ok_button_label}
    </smooth-modal-button>
  </smooth-modal-footer>
</smooth-modal-window>

<style type="text/scss">
  * {
    box-sizing: border-box;
  }

  smooth-modal-window {
    --border-radius: 10px;
  }

  .header {
    margin: 0;
    padding: 20px 30px;
    text-align: center;
    font-size: 1.2em;
    font-weight: 500;
  }

  .body {
    padding: 30px 30px 50px;
    min-height: 0;
    overflow-y: auto;
    text-align: center;
  }

  smooth-modal-button {
    display: flex;
    flex: 1 1 auto;
  }
</style>
