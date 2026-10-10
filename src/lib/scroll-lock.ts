/** Page scroll lock shared by the mobile menu and the smooth-scroll controller. */

type Controller = { stop: () => void; start: () => void };

let controller: Controller | null = null;
let locks = 0;

export function registerScrollController(next: Controller | null): void {
  controller = next;
  if (locks > 0) controller?.stop();
}

export function lockScroll(): void {
  locks += 1;
  if (locks > 1) return;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  if (gap > 0) document.documentElement.style.paddingRight = `${gap}px`;
  controller?.stop();
}

export function unlockScroll(): void {
  if (locks === 0) return;
  locks -= 1;
  if (locks > 0) return;
  document.documentElement.style.overflow = '';
  document.documentElement.style.paddingRight = '';
  controller?.start();
}
