import { useEffect, useState } from "preact/hooks";
import styles from "./Directory.module.scss";

interface MusicTag {
  id: number;
  tagLabel: string;
}

interface PaginationData {
  totalCount: number;
  totalPages: number;
  page: number;
}

export const MusicTags = () => {
  const [musicTags, setMusicTags] = useState<MusicTag[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    totalPages: 0,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchMusicTags = (page: number, currentSortBy = sortBy, currentSortOrder = sortOrder) => {
    setIsLoading(true);
    fetch(`/api/musicTags?page=${page}&limit=${10}&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`)
      .then((res) => res.json())
      .then((res) => {
        setMusicTags(res.data);
        setPagination({
          totalCount: res.totalCount,
          totalPages: res.totalPages,
          page: res.page,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tags:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMusicTags(1);
  }, [sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMusicTags(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleSortChange = (e: any) => {
    const [newSortBy, newSortOrder] = e.target.value.split(":");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  if (isLoading && musicTags.length === 0) return <p>Loading tags...</p>;

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h2>Tags ({pagination.totalCount})</h2>
          <a href="/musicTags/add" className={styles.addLink}>+ Add Tag</a>
        </div>
        <div className={styles.headerControls}>
          <select
            onChange={handleSortChange}
            value={`${sortBy}:${sortOrder}`}
            className={styles.sortSelect}
          >
            <option value="id:desc">Newest Added</option>
            <option value="id:asc">Oldest Added</option>
            <option value="tagLabel:asc">Label (A-Z)</option>
            <option value="tagLabel:desc">Label (Z-A)</option>
          </select>
        </div>
      </header>

      <ul className={styles.list}>
        {musicTags.map((someMusicTag) => (
          <li key={someMusicTag.id} className={styles.item}>
            <div className={styles.itemContent}>
              <div className={styles.itemTitle}>{someMusicTag.tagLabel}</div>
            </div>
            <div className={styles.itemActions}>
              <a
                href={`/musicTags/edit/${someMusicTag.id}`}
                className={styles.editLink}
              >
                Edit
              </a>
            </div>
          </li>
        ))}
      </ul>

      {pagination.totalPages > 1 && (
        <nav className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
            className={styles.pageButton}
          >
            Previous
          </button>
          
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              disabled={isLoading}
              className={`${styles.pageButton} ${p === pagination.page ? styles.activePage : ""}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || isLoading}
            className={styles.pageButton}
          >
            Next
          </button>
        </nav>
      )}

      <a href="/" className={styles.cancelLink}>Back to Home</a>
    </section>
  );
};
