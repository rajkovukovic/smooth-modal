<svelte:options tag="smooth-modal-footer" />

<script lang="ts">
</script>

<div class="footer">
  <slot />
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
</style>
