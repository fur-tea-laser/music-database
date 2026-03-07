import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import styles from "./Form.module.scss";

const MusicCollectionKindFormBase = ({
  title,
  submitLabel,
  initialCollectionLabel,
  onSubmit,
  isSaving,
  headerActions,
}: {
  title: string;
  submitLabel: string;
  initialCollectionLabel: string;
  onSubmit: (label: string) => void;
  isSaving: boolean;
  headerActions?: ComponentChildren;
}) => {
  const [collectionLabel, setCollectionLabel] = useState(
    initialCollectionLabel,
  );

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!collectionLabel.trim()) return;
    onSubmit(collectionLabel);
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
            value={collectionLabel}
            onInput={(e) => setCollectionLabel(e.currentTarget.value)}
            disabled={isSaving}
            placeholder="Enter label..."
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" disabled={isSaving || !collectionLabel}>
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <a href="/musicCollectionKinds" className={styles.cancelLink}>
            Cancel
          </a>
        </div>
      </form>
    </section>
  );
};

export const AddMusicCollectionKindForm = () => {
  const { route } = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (collectionLabel: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/musicCollectionKinds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionLabel }),
      });

      if (response.ok) {
        route("/musicCollectionKinds");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MusicCollectionKindFormBase
      title="Add New Kind"
      submitLabel="Create Kind"
      initialCollectionLabel=""
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
};

export const EditMusicCollectionKindForm = ({ id }: { id: string }) => {
  const { route } = useLocation();
  const [collectionLabel, setCollectionLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/musicCollectionKinds/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setCollectionLabel(data.collectionLabel);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load kind:", err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (label: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicCollectionKinds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionLabel: label }),
      });

      if (response.ok) {
        route("/musicCollectionKinds");
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
      const response = await fetch(`/api/musicCollectionKinds/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        route("/musicCollectionKinds");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <MusicCollectionKindFormBase
      title="Edit Kind"
      submitLabel="Update Kind"
      initialCollectionLabel={collectionLabel}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      headerActions={
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className={styles.deleteButton}
        >
          Delete Kind
        </button>
      }
    />
  );
};
