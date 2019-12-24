declare module 'logic-solver' {
  export class Solver {
    require(...args: (Variable | Term | Formula)[]): void;
    forbid(...args: (Variable | Term | Formula)[]): void;
    solve(): Solution | null;
  }

  export class Solution {
    getTrueVars(): Variable[];
  }

  export type Variable = string;
  export type Term = string | number;
  export type Formula = any;

  export function not(...operands: (Variable | Term | Formula)[]): Formula;
  export function or(...operands: (Variable | Term | Formula)[]): Formula;
  export function and(...operands: (Variable | Term | Formula)[]): Formula;
  export function xor(...operands: (Variable | Term | Formula)[]): Formula;
  export function implies(...operands: (Variable | Term | Formula)[]): Formula;
  export function equiv(...operands: (Variable | Term | Formula)[]): Formula;
  export function exactlyOne(...operands: (Variable | Term | Formula)[]): Formula;
  export function atMostOne(...operands: (Variable | Term | Formula)[]): Formula;
}
