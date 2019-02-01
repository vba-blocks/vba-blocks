import { BY_LINE } from '../utils/text';
export async function toCompiled(graph) {
    return graph;
}
export async function toSrc(graph) {
    // First, normalize line-endings to CRLF
    const { name, references } = graph;
    const components = graph.components.map(component => {
        const code = component.code;
        const lines = code.split(BY_LINE);
        component.code = lines.join('\r\n');
        return component;
    });
    return { name, components, references };
}
