import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import styles from "./Form.module.scss";

const MusicTagFormBase = ({
  title,
  submitLabel,
  initialTagLabel,
  onSubmit,
  isSaving,
  headerActions,
}: {
  title: string;
  submitLabel: string;
  initialTagLabel: string;
  onSubmit: (label: string) => void;
  isSaving: boolean;
  headerActions?: ComponentChildren;
}) => {
  const [tagLabel, setTagLabel] = useState(initialTagLabel);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!tagLabel.trim()) return;
    onSubmit(tagLabel);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2>{title}</h2>
        {headerActions}
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label>Label:</label>
          <input
            type="text"
            value={tagLabel}
            onInput={(e) => setTagLabel(e.currentTarget.value)}
            disabled={isSaving}
            placeholder="Enter tag..."
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" disabled={isSaving || !tagLabel}>
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <a href="/musicTags" className={styles.cancelLink}>Cancel</a>
        </div>
      </form>
    </section>
  );
};

export const AddMusicTagForm = () => {
  const { route } = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (tagLabel: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/musicTags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagLabel }),
      });

      if (response.ok) {
        route("/musicTags");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MusicTagFormBase
      title="Add New Tag"
      submitLabel="Create Tag"
      initialTagLabel=""
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
};

export const EditMusicTagForm = ({ id }: { id: string }) => {
  const { route } = useLocation();
  const [tagLabel, setTagLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/musicTags/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTagLabel(data.tagLabel);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load tag:", err);
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (label: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicTags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagLabel: label }),
      });

      if (response.ok) {
        route("/musicTags");
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
      const response = await fetch(`/api/musicTags/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        route("/musicTags");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <MusicTagFormBase
      title="Edit Tag"
      submitLabel="Update Tag"
      initialTagLabel={tagLabel}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      headerActions={
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className={styles.deleteButton}
        >
          Delete Tag
        </button>
      }
    />
  );
};
