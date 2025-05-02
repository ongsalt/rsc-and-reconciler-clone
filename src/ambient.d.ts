import { KFNode } from "./renderer";

declare global {
    interface Element {
        $$jsx?: KFNode;
    }
}
