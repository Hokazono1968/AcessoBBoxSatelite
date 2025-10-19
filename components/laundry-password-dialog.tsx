"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LaundryPasswordDialogProps {
  password: string | null
  isOpen: boolean
  onClose: () => void
}

export function LaundryPasswordDialog({ password, isOpen, onClose }: LaundryPasswordDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-green-600">Sucesso!</DialogTitle>
          <DialogDescription className="text-center">
            Sua solicitação foi enviada. Anote a senha de acesso à lavanderia:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-5xl font-extrabold text-green-800 tracking-wide">{password}</p>
        </div>
        <DialogFooter className="flex justify-center">
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
