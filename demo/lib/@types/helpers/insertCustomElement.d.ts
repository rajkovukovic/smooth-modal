declare type AddEventListenerArgs = [string, EventListenerOrEventListenerObject, boolean | EventListenerOptions] | [string, EventListenerOrEventListenerObject];
declare type Events = Record<string, EventListenerOrEventListenerObject> | AddEventListenerArgs[];
interface InsertCustomElementArgs {
    tagName: string;
    props: Record<string, any>;
    events: Events;
}
export declare function insertCustomElement(node: HTMLElement, { tagName, props, events, }: InsertCustomElementArgs): {
    update: ({ tagName, props, events, }: InsertCustomElementArgs) => void;
    destroy: () => void;
};
export {};
