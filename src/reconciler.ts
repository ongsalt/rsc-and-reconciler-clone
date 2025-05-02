import { JSXNode, KFNode, kfNodeSymbol } from "./jsx-runtime";
import { provideHook } from "./state";
import { AnyFn, isKfNode, toArray } from "./utils";

export type KfReconcilationContext = {
    evaluatedTree: KFReconcilerNode;
    tree: KFNode;
};


export type KFReconcilerNode = {
    parent?: KFReconcilerNode;
    children: KFReconcilerNode[];
    kfNode: JSXNode;
    states?: any[];
};

export function mount(to: HTMLElement, tree: KFNode) {
    if (to.$$reconciler) {
        throw new Error("another component already mount this element");
    }

    const evaluatedTree = reconcile(tree, null);
    const root = initNode(evaluatedTree) as HTMLElement;

    const context: KfReconcilationContext = {
        evaluatedTree,
        tree,
    };

    console.log(context);
    to.$$reconciler = context;
    to.appendChild(root);

    return {
        render(newTree: KFNode) {
            const evaluatedTree = reconcile(newTree, context.evaluatedTree);
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

// build dom node
function initNode({ kfNode, children }: KFReconcilerNode): Node {
    if (!isKfNode(kfNode)) {
        return document.createTextNode(`${kfNode}`);
    }

    if (typeof kfNode.type === "function") {
        // passthought
        if (children.length === 0) {
            throw new Error("Is this reconcile yet");
        }
        return initNode(children[0]);
    }

    const element = document.createElement(kfNode.type as any) as HTMLElement;
    for (const [key, value] of Object.entries(kfNode.props ?? {})) {
        if (key.startsWith("on")) {
            listen(element, key, value);
        } else {
            element.setAttribute(key, value);
        }
    }

    for (const child of children) {
        element.appendChild(initNode(child));
    }

    return element;
}

function patch(oldTree: KFReconcilerNode | null, newTree: KFReconcilerNode | null, node: Node) {
    // console.log(`patching ${node}`);
    if (!newTree) {
        node.parentElement?.removeChild(node);
        // node.remove();
        return;
    }

    const oldNode = oldTree?.kfNode;
    const newNode = newTree.kfNode;

    const isNewTreeKf = isKfNode(newNode);
    const isOldTreeKf = isKfNode(oldNode);
    // if they different node/element type
    if (isOldTreeKf !== isNewTreeKf) {
        console.log(`Different node type`);
        // todo: extract this to another function
        const newNode = initNode(newTree);
        node.parentElement?.replaceChild(newNode, node);
        node = newNode;
        console.log(node);
        return;
    }

    // if its text node -> diff it
    if (!isNewTreeKf) {
        if (oldTree!.kfNode !== newTree.kfNode) {
            console.log(`[reconciler] Updating textContent: ${newTree.kfNode}`);
            node.textContent = `${newTree.kfNode}`;
        }
        return;
    }

    // ts cant auto catch this so...
    if (!isOldTreeKf) {
        throw new Error("Wtf");
    }

    // we now have both kfnode
    if (newNode.type !== oldNode?.type) {
        console.log(`Different element type`);
        // todo: extract this to another function
        const newNode = initNode(newTree);
        node.parentElement?.replaceChild(newNode, node);
        node = newNode;
        console.log(node);
        return;
    }

    // we now have same node type

    // if its a component
    const oldProps = oldNode.props ?? {};
    const newProps = newNode.props ?? {};
    if (typeof newNode.type === "function") {
        // diff its props - just by shallow ref
        let different = false;
        if (Object.keys(oldProps).length !== Object.keys(newProps).length) {
            different = true;
        } else {
            for (const [key, value] of Object.entries(newProps)) {
                if (oldProps[key] !== value) {
                    different = true;
                    break;
                }
            }
        }

        if (!different) {
            return;
        }
    }

    // Diffing attributes

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
}


// TODO: we need to manage state here
// TODO: keying thing
export function reconcile(node: KFNode | any, oldTree: KFReconcilerNode | null): KFReconcilerNode {
    if (!isKfNode(node)) {
        return {
            children: [],
            kfNode: `${node}`
        };
    }

    if (typeof node.type === "function") {
        const Component = node.type;
        // TODO: find out when to dispose the state 

        const [component, states] = provideHook(oldTree, () => {
            const component = Component({ ...node.props, children: node.children });
            return component;
        });

        const reconcilerNode = reconcile(component, oldTree?.children?.[0] ?? null);
        reconcilerNode.states = states;
        // console.log(states)
        return reconcilerNode;
    }

    const children = toArray(node.children ?? []).map((it, index) => reconcile(it, oldTree?.children?.[index] ?? null));

    return {
        kfNode: {
            $$kind: kfNodeSymbol,
            type: node.type,
            props: node.props,
            children: children.map(it => it.kfNode)
        },
        children,
    };
}