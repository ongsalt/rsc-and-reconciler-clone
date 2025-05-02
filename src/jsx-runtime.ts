import { AnyFn } from "./utils";


namespace JSX {
    // Fuck this, we also need to omit many more thing
    export type IntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: Partial<Omit<HTMLElementTagNameMap[K], "children">> & { children?: JSXNode | JSXNode[]; };
    };
    export type HTMLAttributes = Record<string, JSXNode | JSXNode[] | undefined | AnyFn>;

    export type Element = KFNode;
}

export type JSXNode =
    | KFNode
    | RawContentNode
    | (() => JSXNode)
    | boolean
    | number
    | bigint
    | string
    | null
    | undefined;

interface RawContentNode {
    htmlContent: string;
}

export type { JSX };

export type KFComponent<T extends Record<string, any> = any> = (props: T) => KFNode;
// export type FC<T extends Record<string, any> = any> = KFComponent<T>;
export type PropsOf<T extends KFComponent<any>> = Parameters<T>[0];

export const kfNodeSymbol = Symbol.for("kf-node");
export interface KFNode {
    $$kind: typeof kfNodeSymbol,
    type: string | KFComponent<any> | undefined,
    props?: Record<string, any>;
    children?: JSXNode | JSXNode[] | AnyFn, // TODO: handle case where we pass a function
    key?: string;
}

// TODO: find the attributes type
// this is only temporary workaround
type TagName = keyof HTMLElementTagNameMap;
type ElementProps<T> = T extends TagName ? Partial<HTMLElementTagNameMap[T]> : T extends KFComponent<infer K> ? K : never;
export function h<T extends (TagName | KFComponent<any>)>(type: T, props?: ElementProps<T>, children?: any, key?: string): KFNode {
    return {
        $$kind: kfNodeSymbol,
        type,
        children,
        props,
        key
    };
}

export function jsx(
    type: string | KFComponent | undefined,
    props: JSX.HTMLAttributes,
    key?: string
): JSX.Element {
    const { children, ...rest } = props;
    return {
        $$kind: kfNodeSymbol,
        type,
        children,
        props: rest,
        key
    };
}

export { jsx as jsxs }; // it's for static part, we gonna ignore that
export { jsx as jsxDEV };
