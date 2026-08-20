import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth";
import { ProtectedLayout } from "./layout";
import { LocaleProvider } from "./locale";
import { MediaProvider } from "./media";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { PlayerPage } from "./pages/Player";
import { SettingsPage } from "./pages/Settings";
import { ThemeProvider } from "./theme";

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <MediaProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/player/:id" element={<PlayerPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </MediaProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
