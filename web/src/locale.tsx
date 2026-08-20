import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readJson, writeJson } from "./lib";

export type Locale = "en" | "zh" | "ja";

const KEY = "demo.locale";

const messages = {
  en: {
    login: "Log in",
    email: "Email",
    password: "Password",
    loginError: "Invalid email or password",
    home: "Home",
    settings: "Settings",
    media: "Media",
    title: "Title",
    url: "URL",
    add: "Add",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    empty: "No media yet",
    player: "Player",
    notFound: "Media not found",
    back: "Back",
    language: "Language",
    theme: "Theme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    logout: "Log out",
    nowPlaying: "Now playing",
  },
  zh: {
    login: "登录",
    email: "邮箱",
    password: "密码",
    loginError: "邮箱或密码不正确",
    home: "首页",
    settings: "设置",
    media: "媒体",
    title: "标题",
    url: "链接",
    add: "添加",
    edit: "编辑",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    empty: "暂无媒体",
    player: "播放",
    notFound: "未找到该媒体",
    back: "返回",
    language: "语言",
    theme: "主题",
    themeSystem: "跟随系统",
    themeLight: "明亮",
    themeDark: "暗色",
    logout: "退出登录",
    nowPlaying: "正在播放",
  },
  ja: {
    login: "ログイン",
    email: "メール",
    password: "パスワード",
    loginError: "メールまたはパスワードが正しくありません",
    home: "ホーム",
    settings: "設定",
    media: "メディア",
    title: "タイトル",
    url: "URL",
    add: "追加",
    edit: "編集",
    save: "保存",
    cancel: "キャンセル",
    delete: "削除",
    empty: "メディアがありません",
    player: "プレーヤー",
    notFound: "メディアが見つかりません",
    back: "戻る",
    language: "言語",
    theme: "テーマ",
    themeSystem: "システム",
    themeLight: "ライト",
    themeDark: "ダーク",
    logout: "ログアウト",
    nowPlaying: "再生中",
  },
} as const;

export type Messages = { [K in keyof typeof messages.en]: string };

type LocaleContextValue = {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "zh" || value === "ja";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = readJson<unknown>(KEY, "en");
    return isLocale(stored) ? stored : "en";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: messages[locale],
      setLocale: (next) => {
        setLocaleState(next);
        writeJson(KEY, next);
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
