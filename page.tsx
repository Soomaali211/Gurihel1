import ApiStatus from "@/components/ApiStatus";

const KPIS = ["Users", "Active listings", "Bookings (30d)", "Revenue (30d)"];

export default function DashboardPage() {
  return (
    <>
      <h1>Dashboard</h1>
      <p className="sub">
        Skeleton (WP0). Lambarrada hoose waa <b>placeholder</b> — ma aha xog dhab ah. Xogta dhabta ah waxay ka imaanaysaa WP9.2.
      </p>

      <div className="grid">
        {KPIS.map((k) => (
          <div className="card" key={k}>
            <h2>{k}</h2>
            <div className="kpi">—</div>
            <div className="note">Xog ma jirto weli</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Xaaladda nidaamka</h2>
        <ApiStatus />
        <p className="note">Wuxuu tijaabiyaa API /health/ready (iyo CORS) browser-ka.</p>
      </div>
    </>
  );
}
