import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — Gluvia",
  description: "Create your Gluvia account.",
};

export default function RegisterPage(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="mt-2 text-muted-foreground">
          Registration form will be implemented in Phase 2.
        </p>
      </div>
    </main>
  );
}
