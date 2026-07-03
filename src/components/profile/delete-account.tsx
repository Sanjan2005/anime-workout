"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAccountAction } from "@/app/actions/profile";
import { toast } from "@/components/ui/use-toast";

export function DeleteAccountSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    setLoading(true);
    const result = await deleteAccountAction();
    setLoading(false);

    if (result.error) {
      toast({ title: "Error", description: result.error });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account, workout data, and character images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading
            ? "Deleting..."
            : confirm
              ? "Confirm Delete Account"
              : "Delete Account"}
        </Button>
        {confirm && !loading && (
          <p className="text-xs text-muted-foreground mt-2">
            Click again to confirm. This cannot be undone.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
