import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function FormDialog({ open, onOpenChange, title, description, children, onSubmit, saving }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children: ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-4">{children}<DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
