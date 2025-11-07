"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ProgramPickerProps = {
  /** Optional controlled mode */
  open?: boolean;
  onClose?: () => void;

  /** If true, renders its own trigger button so pages don’t need state */
  asTriggerButton?: boolean;
};

export default function ProgramPicker({
  open,
  onClose,
  asTriggerButton = false,
}: ProgramPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = typeof open === "boolean";
  const isOpen = controlled ? (open as boolean) : internalOpen;

  const handleOpenChange = (v: boolean) => {
    if (controlled) {
      if (!v) onClose?.();
    } else {
      setInternalOpen(v);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {asTriggerButton && (
        <DialogTrigger asChild>
          <Button>Apply Program</Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pick a Program</DialogTitle>
        </DialogHeader>

        {/* TODO: your picker UI goes here */}
      </DialogContent>
    </Dialog>
  );
}