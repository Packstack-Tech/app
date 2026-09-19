import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Button, Input } from '@/components/ui'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogDestructiveAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { useToast } from '@/hooks/useToast'
import { useDeleteAccount } from '@/queries/user'

/** What the user must type to enable the delete button. */
const CONFIRM_WORD = 'DELETE'

/**
 * Close-account control for the bottom of Settings. Mirrors the mobile app's
 * Account screen: one confirmation, then the account and all its data go.
 */
export const DeleteAccount = () => {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()
  const deleteAccount = useDeleteAccount()

  const confirmed = confirmText.trim() === CONFIRM_WORD

  const onOpenChange = (next: boolean) => {
    if (deleteAccount.isPending) return
    setOpen(next)
    if (!next) setConfirmText('')
  }

  const onConfirm = (event: React.SyntheticEvent) => {
    // Keep the dialog up until the request settles, so a slow delete can't be
    // mistaken for a finished one.
    event.preventDefault()
    if (!confirmed) return
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        setOpen(false)
        navigate({ to: '/auth/login' })
      },
      onError: () => {
        toast({
          title: 'Could not delete account',
          description: 'Something went wrong. Please try again.',
        })
      },
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-destructive">
        Delete account
      </h3>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Permanently delete your account, gear closet, trips and kits. This
          cannot be undone.
        </p>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setOpen(true)}
        >
          Delete account
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <form onSubmit={onConfirm} className="flex flex-col gap-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and all associated
                data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
              <label htmlFor="delete-account-confirm" className="text-sm">
                Type <span className="font-semibold">{CONFIRM_WORD}</span> to
                confirm.
              </label>
              <Input
                id="delete-account-confirm"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={CONFIRM_WORD}
                autoComplete="off"
                autoFocus
                disabled={deleteAccount.isPending}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={deleteAccount.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogDestructiveAction
                type="submit"
                onClick={onConfirm}
                disabled={!confirmed || deleteAccount.isPending}
              >
                {deleteAccount.isPending ? 'Deleting…' : 'Delete account'}
              </AlertDialogDestructiveAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
