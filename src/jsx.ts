export type KFComponent<T extends Record<string, any>> = (props: T) => KFNode;
export type PropsOf<T extends KFComponent<any>> = Parameters<T>[0];

export const kfNodeSymbol = Symbol.for("kf-node");
export interface KFNode {
    $$kind: typeof kfNodeSymbol,
    type: string | KFComponent<any>,
    props?: Record<string, any>;
    children?: any,
}

// TODO: find the attributes type
// this is only temporary workaround
type TagName = keyof HTMLElementTagNameMap;
type ElementProps<T> = T extends TagName ? Partial<HTMLElementTagNameMap[T]> : T extends KFComponent<infer K> ? K : never;
export function h<T extends (TagName | KFComponent<any>)>(type: T, props?: ElementProps<T>, children?: any): KFNode {
    return {
        $$kind: kfNodeSymbol,
        type,
        children,
        props,
    };
}
