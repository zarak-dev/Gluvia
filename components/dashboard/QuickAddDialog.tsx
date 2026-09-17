"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogReadingForm } from "@/components/forms/LogReadingForm";

export function QuickAddDialog(): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleSuccess = (): void => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Quick Log</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Log Reading</DialogTitle>
          <DialogDescription>
            Enter your current blood glucose level and meal timing tag.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <LogReadingForm
            compact={true}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
