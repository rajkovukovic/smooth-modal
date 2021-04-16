<script lang="ts">
  import { SmoothModal } from '../../lib/smooth-modal.js';
  import CustomModal from './components/CustomModal.svelte';

  let actionHistory = [];

  function addAction(action: string) {
    actionHistory.push(action);
    actionHistory = actionHistory;
  }

  function showModals() {
    SmoothModal.alert({
      message: 'Alert modal message',
      ok_button_label: 'YES',
      title: 'Hello',
      onResponse: ({ action }) => addAction(`AlertModal: ${action}`),
    });

    SmoothModal.showModal({
      modalComponent: CustomModal,
      modalProps: {
        message: 'Custom modal message',
        title: 'Custom modal title',
        onResponse: ({ action }) => addAction(`CustomModal: ${action}`),
      },
      canDismissOnEnterKey: false,
      canDismissOnEscapeKey: true,
    });
  }

  showModals();
</script>

<main on:click={showModals}>
  <ul>
    {#each actionHistory as action}
      <li>{action}</li>
    {/each}
  </ul>
</main>

<style>
  main {
    min-width: 100vw;
    min-height: 100vh;
  }
</style>
