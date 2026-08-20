import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useLocale, type Locale } from "../locale";
import { useTheme, type Theme } from "../theme";

export function SettingsPage() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <section>
      <h1>{t.settings}</h1>

      <label htmlFor="language">{t.language}</label>
      <select id="language" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
        <option value="en">English</option>
        <option value="zh">中文</option>
        <option value="ja">日本語</option>
      </select>

      <label htmlFor="theme">{t.theme}</label>
      <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
        <option value="system">{t.themeSystem}</option>
        <option value="light">{t.themeLight}</option>
        <option value="dark">{t.themeDark}</option>
      </select>

      <button
        type="button"
        className="danger"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        {t.logout}
      </button>
    </section>
  );
}
