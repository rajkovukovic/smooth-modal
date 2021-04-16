type AddEventListenerArgs = [string, EventListenerOrEventListenerObject, boolean | EventListenerOptions] | [string, EventListenerOrEventListenerObject];

type Events = Record<string, EventListenerOrEventListenerObject> | AddEventListenerArgs[];

interface InsertCustomElementArgs {
  tagName: string;
  props: Record<string, any>;
  events: Events;
}

export function insertCustomElement(
  node: HTMLElement,
  {
    tagName,
    props,
    events,
  }: InsertCustomElementArgs
) {
  let child: HTMLElement;
  let lastTagName: string;
  let lastProps: Record<string, any>;
  let lastEvents: Events;
  let lastNormalizedEvents: AddEventListenerArgs[];

  const setProps = (child: HTMLElement, props: Record<string, any>) => {
    Array.from(Object.entries(props || {})).forEach(([propName, value]) => child[propName] = value);
    lastProps = props;
  }

  const removeProps = () => {
    Array.from(Object.keys(lastProps || {})).forEach((propName) => child.removeAttribute(propName));
  }

  const attachEvents = (child: HTMLElement, events: Events) => {
    if (child && events) {
      const eventArgsArray = Array.isArray(events)
        ? events
        : Array.from(Object.entries(events)).map(([eventName, callback]) => [eventName, callback] as [string, EventListenerOrEventListenerObject]);

      eventArgsArray.forEach(eventArgs => child.addEventListener.apply(null, eventArgs));
      lastEvents = events;
      lastNormalizedEvents = eventArgsArray;
      console.log('attachEvents', { child, eventArgsArray })
    }
  }

  const removeEvents = () => {
    if (child && lastNormalizedEvents) {
      lastNormalizedEvents.forEach(eventArgs => child.removeEventListener.apply(null, eventArgs));
      lastNormalizedEvents = null;
      lastEvents = null;
    }
  }

  const createAndMountChild = (tagName: string) => {
    child = document.createElement(tagName);
    child.style.maxHeight = '100%';
    node.appendChild(child);
    lastTagName = tagName;
  }

  const unmountChild = () => {
    removeEvents();
    node.removeChild(child);
  }

  const update = ({
    tagName,
    props,
    events,
  }: InsertCustomElementArgs) => {
    if (tagName !== lastTagName) {
      unmountChild();
      attachEvents(child, events);
    } else {
      if (props !== lastProps) {
        removeProps();
        setProps(child, props);
      }
      if (events !== lastEvents) {
        removeEvents();
        attachEvents(child, events);
      }
    }
  }

  const destroy = () => {
    unmountChild();
  }

  createAndMountChild(tagName);
  setProps(child, props);
  attachEvents(child, events);

  return {
    update,
    destroy,
  };
}