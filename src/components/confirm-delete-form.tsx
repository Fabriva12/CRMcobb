"use client";

import type { ReactNode } from "react";

export function ConfirmDeleteForm({
  action,
  id,
  confirmMessage,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  confirmMessage: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}