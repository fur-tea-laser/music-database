import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import styles from "./Form.module.scss";

const MusicPlatformFormBase = ({
  title,
  submitLabel,
  initialPlatformName,
  initialPlatformLabel,
  initialPlatformUrl,
  onSubmit,
  isSaving,
  headerActions,
}: {
  title: string;
  submitLabel: string;
  initialPlatformName: string;
  initialPlatformLabel: string;
  initialPlatformUrl: string;
  onSubmit: (name: string, label: string, url: string) => void;
  isSaving: boolean;
  headerActions?: ComponentChildren;
}) => {
  const [platformName, setPlatformName] = useState(initialPlatformName);
  const [platformLabel, setPlatformLabel] = useState(initialPlatformLabel);
  const [platformUrl, setPlatformUrl] = useState(initialPlatformUrl);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!platformName.trim() || !platformLabel.trim() || !platformUrl.trim()) {
      return;
    }
    onSubmit(platformName, platformLabel, platformUrl);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2>{title}</h2>
        {headerActions}
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label>Name:</label>
          <input
            type="text"
            value={platformName}
            onInput={(e) => setPlatformName(e.currentTarget.value)}
            disabled={isSaving}
            placeholder="e.g. Youtube Music, Spotify"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label>Label:</label>
          <input
            type="text"
            value={platformLabel}
            onInput={(e) => setPlatformLabel(e.currentTarget.value)}
            disabled={isSaving}
            placeholder="e.g. YT Music, Spotify"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label>URL:</label>
          <input
            type="url"
            value={platformUrl}
            onInput={(e) => setPlatformUrl(e.currentTarget.value)}
            disabled={isSaving}
            placeholder="https://..."
          />
        </div>
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isSaving || !platformName || !platformLabel ||
              !platformUrl}
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <a href="/musicPlatforms" className={styles.cancelLink}>Cancel</a>
        </div>
      </form>
    </section>
  );
};

export const AddMusicPlatformForm = () => {
  const { route } = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (
    platformName: string,
    platformLabel: string,
    platformUrl: string,
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/musicPlatforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformName, platformLabel, platformUrl }),
      });

      if (response.ok) {
        route("/musicPlatforms");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MusicPlatformFormBase
      title="Add New Platform"
      submitLabel="Create Platform"
      initialPlatformName=""
      initialPlatformLabel=""
      initialPlatformUrl=""
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
};

export const EditMusicPlatformForm = ({ id }: { id: string }) => {
  const { route } = useLocation();
  const [platformName, setPlatformName] = useState("");
  const [platformLabel, setPlatformLabel] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/musicPlatforms/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPlatformName(data.platformName);
          setPlatformLabel(data.platformLabel);
          setPlatformUrl(data.platformUrl);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load platform:", err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (name: string, label: string, url: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicPlatforms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformName: name,
          platformLabel: label,
          platformUrl: url,
        }),
      });

      if (response.ok) {
        route("/musicPlatforms");
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
      const response = await fetch(`/api/musicPlatforms/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        route("/musicPlatforms");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <MusicPlatformFormBase
      title="Edit Platform"
      submitLabel="Update Platform"
      initialPlatformName={platformName}
      initialPlatformLabel={platformLabel}
      initialPlatformUrl={platformUrl}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      headerActions={
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className={styles.deleteButton}
        >
          Delete Platform
        </button>
      }
    />
  );
};
