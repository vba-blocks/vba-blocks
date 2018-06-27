import { BuildGraph } from './build-graph';

const BY_LINE = /(?:\r\n|\r|\n)/g;

export async function toCompiled(graph: BuildGraph): Promise<BuildGraph> {
  return graph;
}

export async function toSrc(graph: BuildGraph): Promise<BuildGraph> {
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
