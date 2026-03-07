import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import styles from "./Form.module.scss";

const MusicArtistFormBase = ({
  title,
  submitLabel,
  initialArtistName,
  onSubmit,
  isSaving,
  headerActions,
}: {
  title: string;
  submitLabel: string;
  initialArtistName: string;
  onSubmit: (name: string) => void;
  isSaving: boolean;
  headerActions?: ComponentChildren;
}) => {
  const [artistName, setArtistName] = useState(initialArtistName);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!artistName.trim()) return;
    onSubmit(artistName);
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
            value={artistName}
            onInput={(e) => setArtistName(e.currentTarget.value)}
            disabled={isSaving}
            placeholder="Enter name..."
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" disabled={isSaving || !artistName}>
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <a href="/musicArtists" className={styles.cancelLink}>Cancel</a>
        </div>
      </form>
    </section>
  );
};

export const AddMusicArtistForm = () => {
  const { route } = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (artistName: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/musicArtists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistName }),
      });

      if (response.ok) {
        route("/musicArtists");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MusicArtistFormBase
      title="Add New Artist"
      submitLabel="Create Artist"
      initialArtistName=""
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
};

export const EditMusicArtistForm = ({ id }: { id: string }) => {
  const { route } = useLocation();
  const [artistName, setArtistName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/musicArtists/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setArtistName(data.artistName);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load artist:", err);
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (name: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicArtists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistName: name }),
      });

      if (response.ok) {
        route("/musicArtists");
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
      const response = await fetch(`/api/musicArtists/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        route("/musicArtists");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <MusicArtistFormBase
      title="Edit Artist"
      submitLabel="Update Artist"
      initialArtistName={artistName}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      headerActions={
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className={styles.deleteButton}
        >
          Delete Artist
        </button>
      }
    />
  );
};
