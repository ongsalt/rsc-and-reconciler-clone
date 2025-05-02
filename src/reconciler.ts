interface KFNode {
    type: string | (() => KFNode),
    props?: Record<string, any>;
}

export function render(to: HTMLElement, definitions: KFNode) {

}