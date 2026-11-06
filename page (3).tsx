export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div className="card login-card">
        <h1>GuriHel Admin</h1>
        <p className="sub">Gelitaan</p>
        {/* Qasab ahaan DISABLED: ma jiro authentication dhab ah weli. Ha ku dhex dhigin sir/koodh been ah. */}
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" disabled />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" disabled />
          <button type="button" disabled>
            Gal (ku soo socota)
          </button>
        </form>
        <p className="note" style={{ marginTop: 14 }}>
          Authentication (SSO + 2FA) wuxuu yimaadaa WP2 / WP9.1. Foomkani ma shaqeeyo.
        </p>
      </div>
    </div>
  );
}
