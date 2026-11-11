"use client";

import { type ComponentProps, createContext, use, useState } from "react";
import { TableRow } from "@/components/ui/table";

type HideRow = (hidden: boolean) => void;

const RowRemoval = createContext<HideRow | null>(null);

/**
 * A table row that a delete button inside it can hide straight away, while the server
 * deletes it and sends the new list. Without this the row stays on screen for
 * seconds after the user confirmed, inviting a second click.
 */
export function RemovableRow(props: ComponentProps<typeof TableRow>) {
  const [hidden, setHidden] = useState(false);
  return (
    <RowRemoval value={setHidden}>
      <TableRow {...props} hidden={hidden || props.hidden} />
    </RowRemoval>
  );
}

/** Inside a RemovableRow: a function that hides (true) or restores (false) it. */
export function useRowRemoval(): HideRow | null {
  return use(RowRemoval);
}
