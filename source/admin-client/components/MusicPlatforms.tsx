import { useEffect, useState } from "preact/hooks";
import styles from "./Directory.module.scss";

export const MusicPlatforms = () => {
  const [platforms, setPlatforms] = useState<
    {
      id: number;
      platformName: string;
      platformLabel: string;
      platformUrl: string;
    }[]
  >([]);

  const fetchPlatforms = () => {
    fetch("/api/musicPlatforms")
      .then((res) => res.json())
      .then((data) => {
        setPlatforms(data);
      });
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2>Platforms</h2>
        <a href="/musicPlatforms/add" className={styles.addLink}>
          + Add Platform
        </a>
      </header>

      <ul className={styles.list}>
        {platforms.map((platform) => (
          <li key={platform.id} className={styles.item}>
            <div className={styles.itemContent}>
              <div className={styles.itemTitle}>
                {platform.platformLabel} ({platform.platformName})
              </div>
              <div className={styles.itemMeta}>
                <a
                  href={platform.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {platform.platformUrl}
                </a>
              </div>
            </div>
            <div className={styles.itemActions}>
              <a
                href={`/musicPlatforms/edit/${platform.id}`}
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
