import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useLocale } from "../locale";

export function LoginPage() {
  const { user, login } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const ok = login(email, password);
    setError(!ok);
  };

  return (
    <main className="auth">
      <h1>{t.login}</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">{t.email}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">{t.password}</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? (
          <p role="alert" className="error">
            {t.loginError}
          </p>
        ) : null}
        <button type="submit">{t.login}</button>
      </form>
    </main>
  );
}
