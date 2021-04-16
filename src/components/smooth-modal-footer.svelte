<svelte:options tag="smooth-modal-footer" />

<script lang="ts">
</script>

<div class="footer">
  <smooth-modal-footer-button>
    OK
  </smooth-modal-footer-button>
</div>

<style type="text/scss">
  * {
    box-sizing: border-box;
  }

  .footer {
    display: flex;
    justify-content: stretch;
    align-items: stretch;
  }

  smooth-modal-footer-button {
    flex: 1 1 auto;
    background-color: transparent;
    &:hover {
      background-color: white;
    }
  }
</style>
