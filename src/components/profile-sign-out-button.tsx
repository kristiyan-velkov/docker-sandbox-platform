"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { signOutAttendee } from "@/lib/actions/workshop";
import { Button } from "@/components/ui/button";

function SignOutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="default" disabled={pending}>
      <LogOut className="size-4" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

export function ProfileSignOutButton() {
  return (
    <form action={signOutAttendee}>
      <SignOutSubmitButton />
    </form>
  );
}
