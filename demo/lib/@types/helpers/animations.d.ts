export declare function fadeIn(node: HTMLElement, { animateTransform, duration }: {
    animateTransform?: boolean;
    duration?: number;
}): {
    duration: number;
    tick: (t: any) => void;
};
export declare function fadeOut(node: HTMLElement, { animateTransform, duration }: {
    animateTransform?: boolean;
    duration?: number;
}): {
    duration: number;
    tick: (t: any) => void;
};
