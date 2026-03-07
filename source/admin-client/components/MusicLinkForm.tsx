import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import styles from "./Form.module.scss";

const MusicLinkFormBase = ({
  title,
  submitLabel,
  initialMusicPlatformId,
  initialLinkUrl,
  availablePlatforms,
  onSubmit,
  isSaving,
  headerActions,
}: {
  title: string;
  submitLabel: string;
  initialMusicPlatformId: number | null;
  initialLinkUrl: string;
  availablePlatforms: { id: number; platformLabel: string }[];
  onSubmit: (platformId: number, url: string) => void;
  isSaving: boolean;
  headerActions?: ComponentChildren;
}) => {
  const [musicPlatformId, setMusicPlatformId] = useState<number | null>(
    initialMusicPlatformId,
  );
  const [linkUrl, setLinkUrl] = useState(initialLinkUrl);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!musicPlatformId || !linkUrl.trim()) return;
    onSubmit(musicPlatformId, linkUrl);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2>{title}</h2>
        {headerActions}
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label>Platform:</label>
          <select
            value={musicPlatformId || ""}
            onChange={(e) =>
              setMusicPlatformId(
                e.currentTarget.value ? Number(e.currentTarget.value) : null,
              )}
            disabled={isSaving}
          >
            <option value="">Select a platform...</option>
            {availablePlatforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.platformLabel}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label>URL:</label>
          <input
            type="url"
            value={linkUrl}
            onInput={(e) => setLinkUrl(e.currentTarget.value)}
            disabled={isSaving}
            placeholder="https://..."
          />
        </div>
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isSaving || !musicPlatformId || !linkUrl}
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <a href="/musicLinks" className={styles.cancelLink}>Cancel</a>
        </div>
      </form>
    </section>
  );
};

export const AddMusicLinkForm = () => {
  const { route } = useLocation();
  const [availablePlatforms, setAvailablePlatforms] = useState<
    { id: number; platformLabel: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/musicPlatforms")
      .then((res) => res.json())
      .then((platforms) => {
        setAvailablePlatforms(platforms);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load platforms:", err);
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (musicPlatformId: number, linkUrl: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/musicLinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicPlatformId, linkUrl }),
      });

      if (response.ok) {
        route("/musicLinks");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading platforms...</p>;

  return (
    <MusicLinkFormBase
      title="Add New Link"
      submitLabel="Create Link"
      initialMusicPlatformId={null}
      initialLinkUrl=""
      availablePlatforms={availablePlatforms}
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
};

export const EditMusicLinkForm = ({ id }: { id: string }) => {
  const { route } = useLocation();
  const [musicPlatformId, setMusicPlatformId] = useState<number | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [availablePlatforms, setAvailablePlatforms] = useState<
    { id: number; platformLabel: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPlatforms = fetch("/api/musicPlatforms").then((res) =>
      res.json()
    );
    const fetchLink = fetch(`/api/musicLinks/${id}`).then((res) => res.json());

    Promise.all([fetchPlatforms, fetchLink]).then(([platforms, link]) => {
      setAvailablePlatforms(platforms);
      setMusicPlatformId(link.musicPlatformId);
      setLinkUrl(link.linkUrl);
      setIsLoading(false);
    }).catch((err) => {
      console.error("Failed to load data:", err);
      setIsLoading(false);
    });
  }, [id]);

  const handleSubmit = async (platformId: number, url: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicLinks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicPlatformId: platformId, linkUrl: url }),
      });

      if (response.ok) {
        route("/musicLinks");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicLinks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        route("/musicLinks");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <MusicLinkFormBase
      title="Edit Link"
      submitLabel="Update Link"
      initialMusicPlatformId={musicPlatformId}
      initialLinkUrl={linkUrl}
      availablePlatforms={availablePlatforms}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      headerActions={
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className={styles.deleteButton}
        >
          Delete Link
        </button>
      }
    />
  );
};
