import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./auth";
import { useLocale } from "./locale";

export function ProtectedLayout() {
  const { user } = useAuth();
  const { t } = useLocale();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app">
      <header>
        <nav>
          <NavLink to="/" end>
            {t.home}
          </NavLink>
          <NavLink to="/settings">{t.settings}</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
