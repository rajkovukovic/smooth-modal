import type { InsertDynamicComponentArgs } from "@smooth-modal";
import { insertCustomElement } from "@smooth-modal";

export function insertDynamicComponent(
  node: HTMLElement,
  {
    tagName,
    props,
    events,
  }: InsertDynamicComponentArgs
) {
  if (typeof tagName === 'string') {
    return insertCustomElement(node, {
      tagName,
      props,
      events, 
    });
  } else {
    let child;
    let lastChildConstructor;
    (window as any).child = child;

    const mount = (childConstructor: any, props: any) => {
      lastChildConstructor = childConstructor;

      child = new (childConstructor)({
        target: node,
        props,
      });
      lastChildConstructor = tagName;
    }

    mount(tagName, props);

    const destroy = () => {
      child.$destroy();
    }

    const update = ({
      tagName,
      props,
      events,
    }: InsertDynamicComponentArgs) => {
      if (lastChildConstructor !== tagName) {
        destroy();
        mount(tagName, props);
      } else {
        child.$set(props);
      }
    }

    return {
      update,
      destroy,
    };
  }
}