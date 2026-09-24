"use client";

import { useEffect, useRef, type RefObject } from "react";

const openModals: symbol[] = [];
let previousOverflow = "";

/** Fokus tetap di modal teratas dan kembali ke pemicu. */
export function useModalFocus(isOpen: boolean, container: RefObject<HTMLDivElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!isOpen || !container.current) return;
    const token = Symbol("modal");
    const previousFocus = document.activeElement as HTMLElement | null;
    if (openModals.length === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openModals.push(token);
    const element = container.current;
    const focusables = () => Array.from(element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");
    (element.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? element).focus();
    const handleKey = (event: KeyboardEvent) => {
      if (openModals[openModals.length - 1] !== token) return;
      if (event.key === "Escape") {
        // Pada popup select bergaya, fokus berada pada <option>, bukan <select>.
        // Escape harus menutup daftar pilihan saja, tanpa menutup formulir induk.
        const focused = document.activeElement;
        if (event.target instanceof HTMLSelectElement || event.target instanceof HTMLOptionElement ||
            focused instanceof HTMLSelectElement || focused instanceof HTMLOptionElement) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      const first = nodes[0] ?? element;
      const last = nodes[nodes.length - 1] ?? element;
      if (!element.contains(document.activeElement) ||
          (event.shiftKey && document.activeElement === first) ||
          (!event.shiftKey && document.activeElement === last) || nodes.length === 0) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      const wasTop = openModals[openModals.length - 1] === token;
      openModals.splice(openModals.indexOf(token), 1);
      if (openModals.length === 0) document.body.style.overflow = previousOverflow;
      if (wasTop && previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, container]);
}
