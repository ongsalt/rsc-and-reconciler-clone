export function App({ name, rerender }: { name: string; rerender: () => unknown; }) {
    return (
        <div>
            <h1>Title</h1>
            <p> jodivhuviui </p>
            <p> Hello {name}</p>
            <button onclick={rerender}> Rerender </button>
            <input type="text" />
        </div>
    );
}
