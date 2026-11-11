import { notFound } from "next/navigation";

// Any URL under /en or /km that no other page matches. Calling notFound() here shows
// the app's own translated, themed 404 (../not-found.tsx) instead of Next.js's default.

// This page never renders anything to check for instant navigation
export const instant = false;

export default function MissingPage() {
  notFound();
}
