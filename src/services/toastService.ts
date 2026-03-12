type ShowFn = (title: string, body: string, onPress?: () => void) => void;

// Module-level singleton — the banner component registers its imperative
// `show` function here so the notification hook can trigger it without
// needing React context or a global store.
let _show: ShowFn | null = null;

export const toastService = {
  register(fn: ShowFn): void {
    _show = fn;
  },
  unregister(): void {
    _show = null;
  },
  show(title: string, body: string, onPress?: () => void): void {
    _show?.(title, body, onPress);
  },
};
