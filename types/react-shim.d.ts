/**
 * Minimal ambient typings for the subset of React 19 used in this project.
 *
 * The build environment this project was authored in could not install
 * `@types/react`. Once you run `npm install` normally, DELETE THIS FILE
 * (the real typings in @types/react / @types/react-dom replace it).
 */
declare module 'react' {
  export type Key = string | number;
  export interface ReactElement {
    type: unknown;
    props: unknown;
    key: Key | null;
  }
  export type ReactNode =
    | ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | Iterable<ReactNode>;

  export type FC<P = {}> = (props: P) => ReactNode;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };

  export type SetStateAction<S> = S | ((prev: S) => S);
  export type Dispatch<A> = (value: A) => void;
  export type Reducer<S, A> = (state: S, action: A) => S;
  export type EffectCallback = () => void | (() => void);

  export interface RefObject<T> {
    current: T;
  }

  export interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  export interface SyntheticEvent<T = Element, E = Event> {
    currentTarget: T;
    target: EventTarget;
    nativeEvent: E;
    preventDefault(): void;
    stopPropagation(): void;
    defaultPrevented: boolean;
  }
  export interface MouseEvent<T = Element> extends SyntheticEvent<T, globalThis.MouseEvent> {
    clientX: number;
    clientY: number;
    button: number;
    detail: number;
  }
  export interface PointerEvent<T = Element> extends MouseEvent<T> {
    pointerId: number;
    pointerType: string;
  }
  export interface KeyboardEvent<T = Element> extends SyntheticEvent<T, globalThis.KeyboardEvent> {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
  }
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }

  export function useState<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useReducer<S, A>(reducer: Reducer<S, A>, initial: S): [S, Dispatch<A>];
  export function useEffect(effect: EffectCallback, deps?: readonly unknown[]): void;
  export function useLayoutEffect(effect: EffectCallback, deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useCallback<T extends (...args: never[]) => unknown>(cb: T, deps: readonly unknown[]): T;
  export function useRef<T>(initial: T): RefObject<T>;
  export function useRef<T>(initial: T | null): RefObject<T | null>;
  export function useId(): string;

  export interface Context<T> {
    Provider: FC<{ value: T; children?: ReactNode }>;
  }
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;

  export class Component<P = {}, S = {}> {
    constructor(props: P);
    readonly props: P & { children?: ReactNode };
    state: S;
    setState(partial: Partial<S>): void;
    render(): ReactNode;
  }

  export function memo<P>(component: FC<P>): FC<P>;
  export function lazy<P>(loader: () => Promise<{ default: FC<P> }>): FC<P>;
  export const Suspense: FC<{ fallback?: ReactNode; children?: ReactNode }>;
  export const StrictMode: FC<{ children?: ReactNode }>;
  export const Fragment: FC<{ children?: ReactNode }>;
}

declare module 'react/jsx-runtime' {
  import type { ReactElement, ReactNode, Key } from 'react';
  export function jsx(type: unknown, props: unknown, key?: Key): ReactElement;
  export function jsxs(type: unknown, props: unknown, key?: Key): ReactElement;
  export const Fragment: unique symbol;
  export namespace JSX {
    type Element = ReactElement;
    type ElementType = string | ((props: any) => ReactNode) | (new (props: any) => { render(): ReactNode });
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicAttributes {
      key?: Key;
    }
    interface IntrinsicElements {
      [tag: string]: Record<string, any>;
    }
  }
}

declare module 'react-dom/client' {
  import type { ReactNode } from 'react';
  export function createRoot(container: Element | DocumentFragment): {
    render(node: ReactNode): void;
    unmount(): void;
  };
}
