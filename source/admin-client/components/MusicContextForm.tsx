import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import styles from "./Form.module.scss";

const MusicContextFormBase = ({
  title,
  submitLabel,
  initialContextLabel,
  onSubmit,
  isSaving,
  headerActions,
}: {
  title: string;
  submitLabel: string;
  initialContextLabel: string;
  onSubmit: (label: string) => void;
  isSaving: boolean;
  headerActions?: ComponentChildren;
}) => {
  const [contextLabel, setContextLabel] = useState(initialContextLabel);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!contextLabel.trim()) return;
    onSubmit(contextLabel);
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
            value={contextLabel}
            onInput={(e) => setContextLabel(e.currentTarget.value)}
            disabled={isSaving}
            placeholder="Enter context..."
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" disabled={isSaving || !contextLabel}>
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <a href="/musicContexts" className={styles.cancelLink}>Cancel</a>
        </div>
      </form>
    </section>
  );
};

export const AddMusicContextForm = () => {
  const { route } = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (contextLabel: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/musicContexts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextLabel }),
      });

      if (response.ok) {
        route("/musicContexts");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MusicContextFormBase
      title="Add New Context"
      submitLabel="Create Context"
      initialContextLabel=""
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
};

export const EditMusicContextForm = ({ id }: { id: string }) => {
  const { route } = useLocation();
  const [contextLabel, setContextLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/musicContexts/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setContextLabel(data.contextLabel);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load context:", err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (label: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicContexts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextLabel: label }),
      });

      if (response.ok) {
        route("/musicContexts");
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
      const response = await fetch(`/api/musicContexts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        route("/musicContexts");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <MusicContextFormBase
      title="Edit Context"
      submitLabel="Update Context"
      initialContextLabel={contextLabel}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      headerActions={
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className={styles.deleteButton}
        >
          Delete Context
        </button>
      }
    />
  );
};
