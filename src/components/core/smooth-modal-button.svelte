<svelte:options tag="smooth-modal-button" />

<script lang="ts">
  let isDefaultProp = false;
  export { isDefaultProp as default };

  $: isDefault = isDefaultProp || isDefaultProp === "";
  $: console.log({ isDefault });
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
    // outline: none;
    background-color: rgba(242, 242, 242);
    text-align: center;
    &.default {
      background-color: var(--primary-color);
      color: var(--primary-color-contrast);
      font-weight: bold;
    }
    // &:focus {
    //   padding: calc(1.2em - 2px) 2ch;
    //   border: 2px dotted silver;
    // }
  }
</style>
