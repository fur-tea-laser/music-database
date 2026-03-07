import { useEffect, useState } from "preact/hooks";
import styles from "./Directory.module.scss";

export const MusicCollectionKinds = () => {
  const [kinds, setKinds] = useState<{ id: number; collectionLabel: string }[]>(
    [],
  );

  const fetchKinds = () => {
    fetch("/api/musicCollectionKinds")
      .then((res) => res.json())
      .then((data) => {
        setKinds(data);
      });
  };

  useEffect(() => {
    fetchKinds();
  }, []);

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2>Kinds</h2>
        <a href="/musicCollectionKinds/add" className={styles.addLink}>
          + Add Kind
        </a>
      </header>

      <ul className={styles.list}>
        {kinds.map((kind) => (
          <li key={kind.id} className={styles.item}>
            <div className={styles.itemContent}>
              <div className={styles.itemTitle}>{kind.collectionLabel}</div>
            </div>
            <div className={styles.itemActions}>
              <a
                href={`/musicCollectionKinds/edit/${kind.id}`}
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
