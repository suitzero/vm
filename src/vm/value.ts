export interface Value<T> {
  current(): T;
  quality(): number;
}
