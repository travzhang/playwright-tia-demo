import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../locale";
import { useMedia } from "../media";

export function HomePage() {
  const { t } = useLocale();
  const { items, add, update, remove } = useMedia();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const onAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    add({ title, url });
    setTitle("");
    setUrl("");
  };

  const startEdit = (id: string, currentTitle: string, currentUrl: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setEditUrl(currentUrl);
  };

  const onSave = (event: FormEvent) => {
    event.preventDefault();
    if (!editingId || !editTitle.trim()) return;
    update(editingId, { title: editTitle, url: editUrl });
    setEditingId(null);
  };

  return (
    <section>
      <h1>{t.home}</h1>
      <p>Hello World</p>
      <form className="row" onSubmit={onAdd}>
        <label htmlFor="media-title">{t.title}</label>
        <input id="media-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label htmlFor="media-url">{t.url}</label>
        <input
          id="media-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
        />
        <button type="submit">{t.add}</button>
      </form>

      {items.length === 0 ? (
        <p className="muted">{t.empty}</p>
      ) : (
        <ul className="media-list">
          {items.map((item) => (
            <li key={item.id}>
              {editingId === item.id ? (
                <form className="row" onSubmit={onSave}>
                  <label htmlFor={`edit-title-${item.id}`}>{t.title}</label>
                  <input
                    id={`edit-title-${item.id}`}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                  <label htmlFor={`edit-url-${item.id}`}>{t.url}</label>
                  <input
                    id={`edit-url-${item.id}`}
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                  />
                  <button type="submit">{t.save}</button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    {t.cancel}
                  </button>
                </form>
              ) : (
                <>
                  <Link to={`/player/${item.id}`}>{item.title}</Link>
                  <button
                    type="button"
                    aria-label={`${t.edit} ${item.title}`}
                    onClick={() => startEdit(item.id, item.title, item.url)}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    aria-label={`${t.delete} ${item.title}`}
                    onClick={() => remove(item.id)}
                  >
                    {t.delete}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
