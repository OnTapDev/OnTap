"use client";

type Listener = (open: boolean) => void;

let isOpen = false;
const listeners = new Set<Listener>();

export function toggleMobileNav() {
  isOpen = !isOpen;
  listeners.forEach((l) => l(isOpen));
}

export function setMobileNav(open: boolean) {
  isOpen = open;
  listeners.forEach((l) => l(open));
}

export function subscribeMobileNav(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}