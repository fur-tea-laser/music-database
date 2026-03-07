import { useEffect, useState } from "preact/hooks";
import styles from "./MusicCollections.module.scss";

interface Track {
  id: number;
  trackTitle: string;
  trackCollectionId: number;
  artists: { id: number; artistName: string }[];
  tags: { id: number; tagLabel: string }[];
  links: {
    id: number;
    linkUrl: string;
    platform: { platformLabel: string } | null;
  }[];
}

interface PaginationData {
  totalCount: number;
  totalPages: number;
  page: number;
}

export const MusicTracks = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    totalPages: 0,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchTracks = (page: number, currentSortBy = sortBy, currentSortOrder = sortOrder) => {
    setIsLoading(true);
    fetch(`/api/musicTracks?page=${page}&limit=${10}&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`)
      .then((res) => res.json())
      .then((res) => {
        setTracks(res.data);
        setPagination({
          totalCount: res.totalCount,
          totalPages: res.totalPages,
          page: res.page,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tracks:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTracks(1);
  }, [sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTracks(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleSortChange = (e: any) => {
    const [newSortBy, newSortOrder] = e.target.value.split(":");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  if (isLoading && tracks.length === 0) return <p>Loading tracks...</p>;

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h2>Tracks ({pagination.totalCount})</h2>
          <a href="/musicTracks/add" className={styles.addLink}>
            + Add Track
          </a>
        </div>
        <div className={styles.headerControls}>
          <select
            onChange={handleSortChange}
            value={`${sortBy}:${sortOrder}`}
            className={styles.sortSelect}
          >
            <option value="id:desc">Newest Added</option>
            <option value="id:asc">Oldest Added</option>
            <option value="trackTitle:asc">Title (A-Z)</option>
            <option value="trackTitle:desc">Title (Z-A)</option>
          </select>
        </div>
      </header>

      <ul className={styles.list}>
        {tracks.map((track) => (
          <li key={track.id} className={styles.item}>
            <div className={styles.itemContent}>
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle}>{track.trackTitle}</div>
                <div className={styles.itemArtists}>
                  {track.artists?.map((a) => a.artistName).join(", ") ||
                    "No artists"}
                </div>
              </div>
              <div className={styles.itemData}>
                <div className={styles.itemBadges}>
                  {track.tags?.map((t) => (
                    <span key={t.id} className={styles.tag}>
                      {t.tagLabel}
                    </span>
                  ))}
                </div>
                <div className={styles.itemLinks}>
                  {track.links?.map((l) => (
                    <a
                      key={l.id}
                      href={l.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {l.platform?.platformLabel || "Link"}
                    </a>
                  ))}
                </div>
              </div>
              <div className={styles.itemActions}>
                <a
                  href={`/musicTracks/edit/${track.id}`}
                  className={styles.editLink}
                >
                  Edit
                </a>
              </div>
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
