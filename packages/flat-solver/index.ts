export type Dependencies = any;
export interface Resolver {}
export interface Solution {}

export async function solve(
  dependencies: Dependencies,
  resolver: Resolver
): Promise<Solution> {
  return Promise.resolve({});
}
