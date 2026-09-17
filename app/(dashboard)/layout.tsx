export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className="min-h-screen">
      {/* Navigation will be added in Phase 2 */}
      <main>{children}</main>
    </div>
  );
}
