declare class SmoothModalClass {
    protected _rootElement: HTMLElement;
    protected _backdropInstance: any;
    constructor();
    get rootElement(): HTMLElement;
    alert(modalProps: Record<string, any>): Promise<boolean>;
    dismissLast(): void;
}
export declare const SmoothModal: SmoothModalClass;
export {};
