"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

const control =
  "block w-full rounded-2xl border bg-white px-4 text-[0.95rem] text-ink shadow-[inset_0_1px_2px_rgb(1_35_19/0.05)] transition-[border-color,box-shadow] duration-(--dur-fast) placeholder:text-ink-muted/60 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12 focus:outline-none";

interface Common {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
}

function Message({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (!error && !hint) return null;
  return (
    <p id={id} className={clsx("mt-1.5 text-[0.82rem]", error ? "text-[#b3261e]" : "text-ink-muted")}>
      {error ?? hint}
    </p>
  );
}

export function TextField({
  label,
  error,
  hint,
  className,
  type = "text",
  ...rest
}: Common & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className">) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const password = type === "password";
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest-900">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={password && shown ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={clsx(
            control,
            "h-12",
            error ? "border-[#b3261e]/60" : "border-cream-200",
            password && "pr-12",
          )}
          {...rest}
        />
        {password && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            className="absolute inset-y-0 right-1 grid w-11 place-items-center rounded-full text-ink-muted transition-colors duration-(--dur-fast) hover:text-forest-700"
          >
            {shown ? (
              <EyeOff aria-hidden="true" className="size-5" />
            ) : (
              <Eye aria-hidden="true" className="size-5" />
            )}
          </button>
        )}
      </div>
      <Message id={`${id}-msg`} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({
  label,
  error,
  hint,
  className,
  options,
  placeholder,
  name,
  value,
  onValueChange,
}: Common & {
  options: readonly string[];
  placeholder: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-label`;
  const optionId = (i: number) => `${id}-opt-${i}`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [upwards, setUpwards] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const selected = options.indexOf(value);

  const show = (index = selected >= 0 ? selected : 0) => {
    const box = field.current?.getBoundingClientRect();
    if (box) {
      const below = window.innerHeight - box.bottom;
      setUpwards(below < 370 && box.top > below);
    }
    setActive(index);
    setOpen(true);
  };
  const close = () => setOpen(false);
  const pick = (index: number) => {
    const option = options[index];
    if (option !== undefined) onValueChange(option);
    close();
    field.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) {
      list.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({
        block: "nearest",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  const jumpTo = (key: string) => {
    const now = Date.now();
    typed.current = {
      text: now - typed.current.at < 700 ? typed.current.text + key.toLowerCase() : key.toLowerCase(),
      at: now,
    };
    const match = options.findIndex((o) => o.toLowerCase().startsWith(typed.current.text));
    if (match >= 0) (open ? setActive : show)(match);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        show(e.key === "Home" ? 0 : last);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) jumpTo(e.key);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(last, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case "Home":
      case "PageUp":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
      case "PageDown":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(active);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) jumpTo(e.key);
    }
  };

  return (
    <div className={className}>
      <label id={labelId} htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest-900">
        {label}
      </label>
      <div ref={root} className="relative">
        <button
          ref={field}
          id={id}
          type="button"
          name={name}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          onClick={() => (open ? close() : show())}
          onKeyDown={onKeyDown}
          className={clsx(
            control,
            "flex h-12 items-center pr-11 text-left",
            open && "border-forest-600 ring-4 ring-forest-600/12",
            error ? "border-[#b3261e]/60" : !open && "border-cream-200",
          )}
        >
          <span className={clsx("truncate", !value && "text-ink-muted/70")}>{value || placeholder}</span>
          <ChevronDown
            aria-hidden="true"
            className={clsx(
              "pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-forest-700 transition-transform duration-(--dur-fast)",
              open && "rotate-180",
            )}
          />
        </button>
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          className={clsx(
            "absolute inset-x-0 z-30 max-h-[22rem] overflow-y-auto overscroll-contain rounded-2xl border border-cream-200 bg-white p-1.5",
            "shadow-[0_22px_48px_-16px_rgb(1_35_19/0.32),0_2px_6px_rgb(1_35_19/0.06)]",
            "transition-[opacity,transform,visibility] duration-150 ease-out",
            upwards ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top",
            open ? "visible scale-100 opacity-100" : "invisible scale-[0.98] opacity-0",
          )}
        >
          {options.map((option, i) => {
            const isSelected = i === selected;
            return (
              <li
                key={option}
                id={optionId(i)}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => active !== i && setActive(i)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pick(i)}
                className={clsx(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-[0.95rem] transition-colors duration-(--dur-fast)",
                  i === active ? "bg-forest-600/[0.08]" : "bg-transparent",
                  isSelected ? "font-semibold text-forest-800" : "text-ink",
                )}
              >
                {option}
                {isSelected && <Check aria-hidden="true" className="size-4 shrink-0 text-forest-600" />}
              </li>
            );
          })}
        </ul>
      </div>
      <Message id={`${id}-msg`} error={error} hint={hint} />
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  ...rest
}: Common & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-forest-900">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={clsx(control, "resize-y py-3", error ? "border-[#b3261e]/60" : "border-cream-200")}
        {...rest}
      />
      <Message id={`${id}-msg`} error={error} hint={hint} />
    </div>
  );
}
