import { useEffect, useState } from "preact/hooks";
import styles from "./Directory.module.scss";

export const MusicContexts = () => {
  const [musicContexts, setMusicContexts] = useState<
    { id: number; contextLabel: string }[]
  >([]);

  const fetchMusicContexts = () => {
    fetch("/api/musicContexts")
      .then((res) => res.json())
      .then((data) => {
        setMusicContexts(data);
      });
  };

  useEffect(() => {
    fetchMusicContexts();
  }, []);

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2>Contexts</h2>
        <a href="/musicContexts/add" className={styles.addLink}>
          + Add Context
        </a>
      </header>

      <ul className={styles.list}>
        {musicContexts.map((someMusicContext) => (
          <li key={someMusicContext.id} className={styles.item}>
            <div className={styles.itemContent}>
              <div className={styles.itemTitle}>
                {someMusicContext.contextLabel}
              </div>
            </div>
            <div className={styles.itemActions}>
              <a
                href={`/musicContexts/edit/${someMusicContext.id}`}
                className={styles.editLink}
              >
                Edit
              </a>
            </div>
          </li>
        ))}
      </ul>
      <a href="/" className={styles.backLink}>Back to Home</a>
    </section>
  );
};
