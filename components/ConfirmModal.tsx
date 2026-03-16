"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cloneElement, useState } from "react";

type Props = {
  trigger: React.ReactElement<{ onClick?: () => void }>;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
};

export function ConfirmModal({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerWithOpen = cloneElement(trigger, { onClick: () => setOpen(true) });

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      {triggerWithOpen}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
              {loading ? "Aguarde..." : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
