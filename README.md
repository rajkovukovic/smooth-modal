# smooth-modal
Modal web component

# demo
```sh
npm install
npm run dev-html-only
```

# using with plain JS
```javascript
import { SmoothModal } from "smooth-modal/dist";

document.getElementById("conditionals-modals-button").onclick = () => {
  function showMustAcceptModal() {
    SmoothModal.alert({
      ok_button_label: "OK",
      message: "Click 'I accept' you little turd!",
      title: "You have to!",
    });
    setTimeout(moreScaryModalRef.destroy, 500);
  }

  let moreScaryModalRef
  function showMoreScaryConfirm() {
    moreScaryModalRef = SmoothModal.confirm({
      ok_button_label: "Argh, OK",
      cancel_button_label: "Go away!",
      message: "We are sorry, but this is not optional.",
      title: "This is not optional",
      onResponse: ({ action }) => {
        console.log({ action });
        if (action === "dismiss") {
          showMustAcceptModal();
          return true;
        }
      },
    });
  }

  SmoothModal.confirm({
    ok_button_label: "I accept",
    cancel_button_label: "No",
    message: "Do you accept our nasty Terms & Conditions?",
    title: "Please accept this",
    onResponse: ({ action }) => {
      console.log({ action });
      if (action === "dismiss") {
        showMoreScaryConfirm();
        return true;
      }
    },
  });
};

```

# using with Svelte
``` svelte
<script lang="ts">
  import { dispatchModalAction } from 'smooth-modal/dist';

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
```
