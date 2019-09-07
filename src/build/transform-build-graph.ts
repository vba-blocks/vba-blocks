import asyncFlow from '../utils/async-flow';
import { BuildGraph } from './build-graph';
import * as editorConfig from './transforms/editor-config';

const transforms = [editorConfig];

export const toCompiled = asyncFlow<BuildGraph>(
  ...transforms.map(transform => transform.toCompiled).filter(Boolean)
);
export const toSrc = asyncFlow<BuildGraph>(
  ...transforms.map(transform => transform.toSrc).filter(Boolean)
);
