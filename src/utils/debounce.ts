export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300,
) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
