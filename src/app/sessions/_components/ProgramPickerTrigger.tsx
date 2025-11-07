"use client";

import { useState } from "react";
import ProgramPicker from "./ProgramPicker";
import { Button } from "@/components/ui/button"; // your shadcn Button

export default function ProgramPickerTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)}>+ Program</Button>
      <ProgramPicker open={open} onClose={() => setOpen(false)} />
    </>
  );
}