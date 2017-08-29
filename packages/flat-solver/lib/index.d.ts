export declare type Dependencies = any;
export interface Resolver {}
export interface Solution {}
export declare function solve(
  dependencies: Dependencies,
  resolver: Resolver
): Promise<Solution>;
