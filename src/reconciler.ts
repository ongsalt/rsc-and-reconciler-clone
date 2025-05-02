import { KFNode, kfNodeSymbol } from "./jsx-runtime";
import { AnyFn, isKfNode, toArray } from "./utils";

export type KfReconcilationContext = {
    evaluatedTree: KFNode;
    tree: KFNode;
};

export type KfNodeContext = {
    // eventListeners: Record<string, (...args: unknown[]) => unknown>;
};

export function mount(to: HTMLElement, tree: KFNode) {
    if (to.$$reconciler) {
        throw new Error("another component already mount this element");
    }

    const evaluatedTree = evaluateJsx(tree);
    const root = initNode(evaluatedTree) as HTMLElement;

    const context: KfReconcilationContext = {
        evaluatedTree,
        tree,
    };
    // console.log(context);
    to.$$reconciler = context;
    to.appendChild(root);

    return {
        render(newTree: KFNode) {
            const evaluatedTree = evaluateJsx(newTree);
            // console.log({ newTree, evaluatedTree });

            patch(context.evaluatedTree!, evaluatedTree, root);

            context!.tree = newTree;
            context!.evaluatedTree = evaluatedTree;
        },
        unmount() {
            // TODO: some cleanup
            delete to.$$reconciler;
        }
    };
}

function listen(to: Element, eventType: string, handler: AnyFn, previousHandler?: AnyFn) {
    // if (!to.$$nodeContext) {
    //     to.$$nodeContext = {
    //         eventListeners: {}
    //     };
    // }
    const type = eventType.slice(2);
    // const previousHandler = to.$$nodeContext.eventListeners[type];
    if (previousHandler) {
        to.removeEventListener(type, previousHandler);
    }
    // to.$$nodeContext.eventListeners[type] = handler;
    to.addEventListener(type, handler);
}

function initNode(node: KFNode): Node {
    if (!isKfNode(node)) {
        return document.createTextNode(`${node}`);
    }

    if (typeof node.type === "function") {
        throw new Error("node must be rendered first");
    }

    const element = document.createElement(node.type as any) as HTMLElement;
    for (const [key, value] of Object.entries(node.props ?? {})) {
        if (key.startsWith("on")) {
            listen(element, key, value);
        } else {
            element.setAttribute(key, value);
        }
    }

    const children = toArray(node.children);
    for (const child of children) {
        element.appendChild(initNode(child));
    }

    return element;
}

function patch(oldTree: KFNode | null, newTree: KFNode | null, node: Node): Node | null {
    // console.log(`patching ${node}`);
    if (!newTree) {
        node.parentElement?.removeChild(node);
        // node.remove();
        return null;
    }

    const isNewTreeKf = isKfNode(newTree);
    const isOldTreeKf = isKfNode(oldTree);
    // if they different node/element type
    if (isOldTreeKf !== isNewTreeKf || newTree.type !== oldTree?.type) {
        console.log(`Different node type`);
        // todo: extract this to another function
        const newNode = initNode(newTree);
        node.parentElement?.replaceChild(newNode, node);
        node = newNode;
        console.log(node);
    }

    if (!isNewTreeKf) {
        if (!isOldTreeKf && oldTree !== newTree) {
            console.log(`[reconciler] Updating textContent: ${newTree} for`, node);
            node.textContent = `${newTree}`;
        }
        return node;
    }

    // Diffing attributes
    const oldProps = oldTree?.props ?? {};
    const newProps = newTree?.props ?? {};

    // todo: event handler
    for (const [key, _] of Object.entries(oldProps)) {
        if (!(key in newProps)) {
            console.log(`[reconciler] Remove attribute ${key} from`, node);
            (node as Element).removeAttribute(key);
        }
    }

    for (const [key, value] of Object.entries(newProps)) {
        if (!(key in oldProps) || oldProps[key] !== value) {
            console.log(`[reconciler] Set attribute ${key} to ${value} for`, node);
            const element = node as Element;
            if (key.startsWith("on")) {
                listen(element, key, value, oldProps[key]);
            } else {
                element.setAttribute(key, value);
            }
        }
    }

    // Diffing children
    // TODO: key
    const oldChildren = toArray(oldTree?.children ?? []);
    const newChildren = toArray(newTree?.children ?? []);

    for (let i = 0; i < oldChildren.length; i++) {
        patch(oldChildren[i], newChildren[i] ?? null, node.childNodes[i]);
    }

    return node;
}

type StateNode = {
    parent: StateNode;
    states: any[];
    children: StateNode;
};

// TODO: implement this when we have jsx
export function evaluateJsx(node: KFNode | any): KFNode | any {
    // keep string/number/... as is
    if (!isKfNode(node)) {
        return `${node}`;
    }

    if (typeof node.type === "function") {
        const Component = node.type;
        // we need to do state here
        // state tree or something?
        const it = Component({ ...node.props, children: node.children });

        return evaluateJsx(it);
    }

    return {
        $$kind: kfNodeSymbol,
        type: node.type,
        props: node.props,
        children: toArray(node.children ?? []).map(it => evaluateJsx(it))
    };
}
