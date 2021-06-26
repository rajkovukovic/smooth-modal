<script lang="ts">
  import { dispatchModalAction } from '../../../lib/smooth-modal.js';

  export let title: string = 'no title';
  export let message: string = 'no body';

  let rootElement: HTMLElement;
</script>

<smooth-modal-window bind:this={rootElement}>
  <h1
    slot="header"
    style="
    margin: 0;
    padding: 20px 30px;
    text-align: center;
    font-size: 1.2em;
    font-weight: 500;"
  >
    {title || ''}
  </h1>

  <form action="" class="body" method="get">
    <div class="form-example">
      <label for="name">Enter your name: </label>
      <input type="text" name="name" id="name" required />
    </div>
    <div class="form-example">
      <label for="email">Enter your email: </label>
      <input type="email" name="email" id="email" required />
    </div>
  </form>

  <smooth-modal-footer slot="footer">
    <smooth-modal-button
      on:click={() => dispatchModalAction(rootElement, 'dismiss')}
    >
      Cancel
    </smooth-modal-button>

    <smooth-modal-button
      on:click={() => dispatchModalAction(rootElement, 'submit-no-subscribe')}
    >
      Submit - no subscribe
    </smooth-modal-button>

    <smooth-modal-button
      default
      on:click={() => dispatchModalAction(rootElement, 'submit-with-subscribe')}
    >
      Submit with subscribe
    </smooth-modal-button>
  </smooth-modal-footer>
</smooth-modal-window>

<style>
  * {
    box-sizing: border-box;
  }

  smooth-modal-window {
    --border-radius: 10px;
  }

  .body {
    padding: 30px 30px 50px;
    min-height: 0;
    overflow-y: auto;
    text-align: center;
  }

  smooth-modal-footer {
  }

  smooth-modal-button {
    display: flex;
    flex: 1 1 auto;
  }
</style>
