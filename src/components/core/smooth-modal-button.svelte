<svelte:options tag="smooth-modal-button" />

<script lang="ts">
  let isDefaultProp = false;
  export { isDefaultProp as default };

  $: isDefault = isDefaultProp || isDefaultProp === "";
</script>

<button class:default={isDefault}>
  <slot />
</button>

<style type="text/scss">
  * {
    box-sizing: border-box;
  }

  button {
    flex: 1 1 auto;
    padding: 1.2em 2ch;
    border: none;
    background-color: rgba(242, 242, 242);
    text-align: center;
    cursor: pointer;
    &.default {
      background-color: var(--primary-color);
      color: var(--primary-color-contrast);
      font-weight: bold;
    }
    &:hover {
      filter: brightness(1.04);
    }
  }
</style>
