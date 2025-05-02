import { KfReconcilationContext, KfNodeContext } from "./reconciler";

declare global {
    interface Element {
        $$reconciler?: KfReconcilationContext;
        $$nodeContext?: KfNodeContext;
    }
}
