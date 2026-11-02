"use client"; // Error boundaries must be Client Components

import { RotateCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error); // a real app would report this to an error tracker
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlert}
      title="Something went wrong"
      description="We couldn't load this page. Your data is safe; please try again."
      action={
        <Button onClick={() => retry()}>
          <RotateCw aria-hidden />
          Try again
        </Button>
      }
    />
  );
}
