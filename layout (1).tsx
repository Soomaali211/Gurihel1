import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // TODO (WP2/WP9): halkan ku dar hubinta session-ka + RBAC (redirect /login haddii aan la gelin).
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
