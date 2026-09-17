import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Gluvia",
  description: "Sign in to your Gluvia account.",
};

export default function LoginPage(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-2 text-muted-foreground">
          Authentication form will be implemented in Phase 2.
        </p>
      </div>
    </main>
  );
}
