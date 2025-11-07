// src/components/ui/dialog.tsx
"use client";

import * as React from "react";
import * as RD from "@radix-ui/react-dialog";

export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;

export function DialogPortal(props: RD.DialogPortalProps) {
  return <RD.Portal {...props} />;
}

export function DialogOverlay(props: RD.DialogOverlayProps) {
  return (
    <RD.Overlay
      className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out"
      {...props}
    />
  );
}

export function DialogContent({
  className = "",
  ...props
}: RD.DialogContentProps & { className?: string }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RD.Content
        className={
          "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl outline-none dark:bg-slate-900 " +
          className
        }
        {...props}
      />
    </DialogPortal>
  );
}

export function DialogHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={"mb-4 space-y-1 " + className} {...props} />;
}

export function DialogTitle({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof RD.Title>) {
  return (
    <RD.Title
      className={"text-lg font-semibold leading-none tracking-tight " + className}
      {...props}
    />
  );
}

export function DialogDescription({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof RD.Description>) {
  return (
    <RD.Description
      className={"text-sm text-slate-600 dark:text-slate-400 " + className}
      {...props}
    />
  );
}

export function DialogFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={"mt-6 flex justify-end gap-2 " + className} {...props} />;
}

export const DialogClose = RD.Close;