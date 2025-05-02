import { KFNode, kfNodeSymbol } from "./renderer";
import { assert, isKfNode, toArray } from "./utils";

export function mount(to: HTMLElement, jsx: KFNode) {
    if (to.$$jsx) {
        throw new Error("what");
    }

    let oldTree = jsx;
    const root = create(jsx) as HTMLElement;
    console.log({ jsx, root });
    to.appendChild(root);

    return {
        render(newTree: KFNode) {
            console.log({ newTree });
            patch(oldTree, newTree, root);
            oldTree = newTree;
        },
        unmount() {
            // TODO: some cleanup
            delete to.$$jsx;
        }
    };
}

function create(node: KFNode): Node {
    if (!isKfNode(node)) {
        return document.createTextNode(`${node}`);
    }

    const _node = node as KFNode;
    if (typeof _node.type === "function") {
        throw new Error("node must be rendered first");
    }

    const element = document.createElement(_node.type as any) as HTMLElement;
    for (const [key, value] of Object.entries(_node.props ?? {})) {
        element.setAttribute(key, value);
    }

    const children = toArray(_node.children);
    for (const child of children) {
        element.appendChild(create(child));
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
        const newNode = create(newTree);
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
            (node as Element).setAttribute(key, value);
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
