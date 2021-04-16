<svelte:options tag="smooth-modal-window" />

<script lang="ts">
  export let title: string = null;
  export let message: string = 'no message';
  export let ok_button_label: string = 'OK';
  export let onDismiss: Function = null;
</script>

<div class="smooth-modal" on:click>
  <h1 class="header">{title || ''}</h1>

  <div class="body">
    <input value="try focus" />
    <div>
      {message || ''}
    </div>
  </div>

  <div class="footer">
    <slot name="footer">
      <smooth-modal-footer>
        <smooth-modal-footer-button>{ok_button_label}</smooth-modal-footer-button>
      </smooth-modal-footer>
    </slot>
  </div>
</div>

<style type="text/scss">
  * {
    box-sizing: border-box;
  }

  .smooth-modal {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    max-height: 100%;
    overflow-y: auto;
    background-color: white;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.2));
    // border-radius: 10px;
    & > * {
      overflow-y: auto;
    }
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 1;
    flex: 0 0 auto;
    margin: 0;
    padding: 20px 20px 20px;
    text-align: center;
    font-size: 1.2;
    font-weight: 500;
  }

  .header,
  .footer {
    background-color: rgba(255, 255, 255, 0.95);
  }

  .body {
    flex: 1 0 auto;
    padding: 10px 100px 50px;
    min-height: 0;
    text-align: center;
  }

  .footer {
    position: sticky;
    bottom: 0;
    z-index: 1;
    flex: 0 0 auto;
    overflow: auto;
    border-top: 1px solid rgba(224, 224, 224);
  }
</style>
