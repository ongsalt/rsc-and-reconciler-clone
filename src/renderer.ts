export const kfNodeSymbol = Symbol.for("kf-node");
export interface KFNode {
    $$kind: typeof kfNodeSymbol,
    type: string | ((...args: any[]) => KFNode),
    props?: Record<string, any>;
    children?: any,
}


// TODO: find the attributes type
// this is only temporary workaround
type TagName = keyof HTMLElementTagNameMap;
type ElementProps<T> = T extends TagName ? Partial<HTMLElementTagNameMap[T]> : Record<string, any>;
export function h<T extends (TagName | (() => KFNode))>(type: T, props?: ElementProps<T>, children?: any): KFNode {
    return {
        $$kind: kfNodeSymbol,
        type,
        children,
        props,
    };
}

// TODO: implement this when we have jsx
export function render(node: KFNode | any): KFNode | any {
    // keep string/number/... as is
    if (typeof node !== "object" || node?.$$kind !== kfNodeSymbol) {
        return `${node}`;
    }

    if (typeof node.type === "function") {
        const Component = node.type;
        const it = Component({ ...node.props, children: node.children });
        return render(it);
    }

    return {
        $$kind: kfNodeSymbol,
        type: node.type,
        props: node.props,
        children: Array.isArray(node.children) ? node.children.map(render) : render(node.children)
    };
}
