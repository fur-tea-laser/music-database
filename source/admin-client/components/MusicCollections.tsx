import { useEffect, useState } from "preact/hooks";
import styles from "./MusicCollections.module.scss";

interface MusicCollection {
  id: number;
  collectionTitle: string;
  collectionCoverUrl: string;
  collectionDateYear: number;
  collectionDateMonth: number;
  artists: { artistName: string }[];
  tags: { tagLabel: string }[];
  contexts: { contextLabel: string }[];
  links: { linkUrl: string; platform: { platformLabel: string } | null }[];
  kind: { id: number; collectionLabel: string } | null;
  tracks: {
    id: number;
    trackTitle: string;
    artists: { artistName: string }[];
    tags: { tagLabel: string }[];
    links: { linkUrl: string; platform: { platformLabel: string } | null }[];
  }[];
}

interface PaginationData {
  totalCount: number;
  totalPages: number;
  page: number;
}

export const MusicCollections = () => {
  const [musicCollections, setMusicCollections] = useState<MusicCollection[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    totalPages: 0,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchMusicCollections = (page: number, currentSortBy = sortBy, currentSortOrder = sortOrder) => {
    setIsLoading(true);
    fetch(`/api/musicCollections?page=${page}&limit=${10}&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`)
      .then((res) => res.json())
      .then((res) => {
        setMusicCollections(res.data);
        setPagination({
          totalCount: res.totalCount,
          totalPages: res.totalPages,
          page: res.page,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch collections:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMusicCollections(1);
  }, [sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMusicCollections(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleSortChange = (e: any) => {
    const [newSortBy, newSortOrder] = e.target.value.split(":");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  if (isLoading && musicCollections.length === 0) return <p>Loading...</p>;

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h2>Collections ({pagination.totalCount})</h2>
          <a href="/musicCollections/add" className={styles.addLink}>
            + Add Collection
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
            <option value="collectionDate:desc">Release Date (Newest)</option>
            <option value="collectionDate:asc">Release Date (Oldest)</option>
            <option value="collectionTitle:asc">Title (A-Z)</option>
            <option value="collectionTitle:desc">Title (Z-A)</option>
          </select>
        </div>
      </header>

      <ul className={styles.list}>
        {musicCollections.map((someMusicCollection) => (
          <li key={someMusicCollection.id} className={styles.item}>
            <div className={styles.itemDataContainer}>
              <div className={styles.itemMain}>
                <img
                  src={someMusicCollection.collectionCoverUrl}
                  className={styles.itemImage}
                />
                <div className={styles.itemContent}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>
                      {someMusicCollection.collectionTitle}
                    </div>
                    <div className={styles.itemMeta}>
                      <span>
                        {someMusicCollection.collectionDateYear}-{String(
                          someMusicCollection.collectionDateMonth,
                        ).padStart(2, "0")}
                      </span>
                      {someMusicCollection.kind && (
                        <span className={styles.kind}>
                          {someMusicCollection.contexts?.map((someContext) =>
                            someContext.contextLabel
                          ).join("/")} {someMusicCollection.kind.collectionLabel}
                        </span>
                      )}                    </div>
                    <div className={styles.itemArtists}>
                      {someMusicCollection.artists?.map((a) =>
                        a.artistName
                      ).join(", ") || "No artists"}
                    </div>
                  </div>
                  <div className={styles.itemData}>
                    <div className={styles.itemBadges}>
                      {someMusicCollection.tags?.map((t) => (
                        <span key={t.tagLabel} className={styles.tag}>
                          {t.tagLabel}
                        </span>
                      ))}
                    </div>
                    <div className={styles.itemLinks}>
                      {someMusicCollection.links?.map((l) => (
                        <a
                          key={l.linkUrl}
                          href={l.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {l.platform?.platformLabel || "Link"}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {someMusicCollection.tracks &&
                someMusicCollection.tracks.length > 0 && (
                <div className={styles.itemTracksRow}>
                  <details className={styles.itemTracksDetails}>
                    <summary className={styles.itemTracksSummary}>
                      Feature Tracks ({someMusicCollection.tracks.length})
                    </summary>
                    <div className={styles.itemTracks}>
                      <ul>
                        {someMusicCollection.tracks.map((track) => (
                          <li key={track.id}>
                            <div className={styles.trackContent}>
                              <div className={styles.trackInfo}>
                                <span className={styles.trackTitle}>
                                  {track.trackTitle}
                                </span>
                                {track.artists && track.artists.length > 0 && (
                                  <span className={styles.trackArtists}>
                                    {track.artists.map((a) => a.artistName).join(
                                      ", ",
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className={styles.trackTags}>
                                {track.tags?.map((t) => (
                                  <span key={t.tagLabel} className={styles.tag}>
                                    {t.tagLabel}
                                  </span>
                                ))}
                              </div>
                              <div className={styles.trackLinks}>
                                {track.links?.map((l) => (
                                  <a
                                    key={l.linkUrl}
                                    href={l.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: "0.75em" }}
                                  >
                                    {l.platform?.platformLabel || "Link"}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>
              )}
            </div>

            <div className={styles.itemActions}>
              <a
                href={`/musicCollections/edit/${someMusicCollection.id}`}
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
