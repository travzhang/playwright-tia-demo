import { Link, useParams } from "react-router-dom";
import { useLocale } from "../locale";
import { useMedia } from "../media";

export function PlayerPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const { get } = useMedia();
  const item = id ? get(id) : undefined;

  if (!item) {
    return (
      <section>
        <h1>{t.player}</h1>
        <p role="status">{t.notFound}</p>
        <Link to="/">{t.back}</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>{t.player}</h1>
      <p>
        {t.nowPlaying}: {item.title}
      </p>
      <p>ID: {item.id}</p>
      {item.url ? <video src={item.url} controls /> : null}
      <p>
        <Link to="/">{t.back}</Link>
      </p>
    </section>
  );
}
