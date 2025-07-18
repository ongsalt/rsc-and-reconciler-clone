import { KFReconcilerNode, reconcile } from "./reconciler";

// TODO remove activeStates
let currentRerenderFn: { rerender(): unknown; } | null = null;
let activeStates: any[] | null = null;
let stateIndex = 0;

export function provideHook<T = unknown>(reconcilerNode: KFReconcilerNode | null, fn: () => T) {
    const previous = activeStates;
    const previousRerenderFn = currentRerenderFn;
    const previousIndex = stateIndex;

    const rerenderRef = { rerender: (): any => { throw new Error("did not register rerender function"); } };
    currentRerenderFn = rerenderRef;
    activeStates = reconcilerNode?.states ?? [];
    const value = fn();
    const states = activeStates;

    activeStates = previous;
    stateIndex = previousIndex;
    currentRerenderFn = previousRerenderFn;

    function registerRerenderFn(node: KFReconcilerNode) {
        rerenderRef.rerender = () => reconcile(node);
    }

    return [value, states, registerRerenderFn] as const;
}

type Setter<T> = ((value: T | ((previous: T) => T)) => void);

export function useState<T>(initialValue: T): [T, Setter<T>] {
    if (!activeStates || !currentRerenderFn) {
        throw new Error("You can only call useState from a component");
    }
    let value = initialValue;
    if (activeStates.length <= stateIndex) {
        activeStates.push(initialValue);
    } else {
        value = activeStates[stateIndex];
    }
    const rerenderRef = currentRerenderFn;
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
        // console.log(`Update value: `, states[index]);
        rerenderRef.rerender();
    };
    // tell the reconcilerNode some how to rerender
    return [value, setter];
}

export function useRef<T>(initialValue: T): { value: T; } {
    if (!activeStates || !currentRerenderFn) {
        throw new Error("You can only call useRef from a component");
    }
    if (activeStates.length <= stateIndex) {
        activeStates.push(initialValue);
    }
    const states = activeStates;
    const index = stateIndex;
    stateIndex += 1;

    return {
        get value() {
            return states[index];
        },
        set value(newValue) {
            states[index] = newValue;
        }
    };
}

export function useEffect(callback: () => unknown, dependencies: any[] = []) {
    const dependenciesRef = useRef([] as any[]);
    
    if (dependenciesRef.value.length !== dependencies.length) {
        throw new Error("dependencies lenght change detected (should we allow this)");
    } else {
        for (let i = 0; i < dependencies.length; i++) {
            if (dependencies[i] !== dependenciesRef.value[i]) {
                // wait but in react this will run after mount tho
                // and we also dont do any cleanup yet
                callback();
                dependenciesRef.value.splice(0, dependenciesRef.value.length);
                dependenciesRef.value.push(...dependencies);
                return;
            }
        }
    }
}

