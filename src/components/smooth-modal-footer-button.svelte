<svelte:options tag="smooth-modal-footer-button" />

<script lang="ts">
  let isDefault = false;
  export { isDefault as default };
</script>

<div tab-index="0">
  <slot />
</div>

<style type="text/scss">
  * {
    box-sizing: border-box;
  }

  div {
    flex: 1 1 auto;
    display: block;
    padding: 1.2em 2ch;
    text-align: center;
  }
</style>
