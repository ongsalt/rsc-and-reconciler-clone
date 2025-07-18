import { App } from "./App";
import { mount } from "./reconciler";

const appRoot = document.getElementById("app")!;

const { } = mount(appRoot, <App name="Kanade"/>);
