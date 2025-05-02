import { KFReconcilerNode } from "./reconciler";

let activeStates: any[] | null = null;
let stateIndex = 0;

export function provideHook<T = unknown>(reconcilerNode: KFReconcilerNode | null, fn: () => T) {
    const previous = activeStates;
    const previousIndex = stateIndex;
    activeStates = reconcilerNode?.states ?? [];
    const value = fn();
    const states = activeStates;
    activeStates = previous;
    stateIndex = previousIndex;
    return [value, states] as const;
}

type Setter<T> = ((value: T | ((previous: T) => T)) => void);

export function useState<T>(initialValue: T): [T, Setter<T>] {
    if (!activeStates) {
        throw new Error("You can only call useState from a component");
    }
    let value = initialValue;
    if (activeStates.length <= stateIndex) {
        activeStates.push(initialValue);
    } else {
        value = activeStates[stateIndex];
    }
    const states = activeStates;
    const index = stateIndex;
    stateIndex += 1;

    const setter: Setter<T> = (value) => {
        if (typeof value === "function") {
            // @ts-ignore sometime this will be ambigous, if T is a function
            states[index] = value(states[index]);
        } else {
            states[index] = value;
        }
        console.log(states[index]);
    };
    // tell the reconcilerNode some how to rerender
    return [value, setter];
}
