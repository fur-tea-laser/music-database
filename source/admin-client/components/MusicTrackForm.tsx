import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { SearchableMultiSelect } from "./SearchableMultiSelect.tsx";
import styles from "./Form.module.scss";

export interface MusicTrackFormValues {
  id?: number;
  trackTitle: string;
  trackCollectionId: number | null;
  artistIds: number[];
  tagIds: number[];
  links: { musicPlatformId: number; linkUrl: string }[];
}

export interface MusicTrackAvailableData {
  artists: { id: number; artistName: string }[];
  tags: { id: number; tagLabel: string }[];
  collections: { id: number; collectionTitle: string }[];
  platforms: { id: number; platformLabel: string }[];
}

const defaultFormValues: MusicTrackFormValues = {
  trackTitle: "",
  trackCollectionId: null,
  artistIds: [],
  tagIds: [],
  links: [],
};

export const MusicTrackFormBase = ({
  title,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  headerActions,
  availableData: propAvailableData,
  hideCollectionSelector = false,
  isOverlay = false,
  onCreateArtist: propOnCreateArtist,
  onCreateTag: propOnCreateTag,
}: {
  title: string;
  submitLabel: string;
  initialValues: MusicTrackFormValues;
  onSubmit: (values: MusicTrackFormValues) => void;
  onCancel?: () => void;
  isSaving: boolean;
  headerActions?: ComponentChildren;
  availableData?: MusicTrackAvailableData;
  hideCollectionSelector?: boolean;
  isOverlay?: boolean;
  onCreateArtist?: (artist: { id: number; artistName: string }) => void;
  onCreateTag?: (tag: { id: number; tagLabel: string }) => void;
}) => {
  const [formValues, setFormValues] = useState<MusicTrackFormValues>(
    initialValues,
  );
  const [availableData, setAvailableData] = useState<MusicTrackAvailableData>(
    propAvailableData || {
      artists: [],
      tags: [],
      collections: [],
      platforms: [],
    },
  );
  const [isLoadingData, setIsLoadingData] = useState(!propAvailableData);

  useEffect(() => {
    if (propAvailableData) {
      setAvailableData(propAvailableData);
      return;
    }
    const fetchData = async () => {
      try {
        const [artistsRes, tagsRes, collectionsRes, platforms] = await Promise.all([
          fetch("/api/musicArtists?limit=100").then((res) => res.json()),
          fetch("/api/musicTags?limit=100").then((res) => res.json()),
          fetch("/api/musicCollections?limit=100").then((res) => res.json()),
          fetch("/api/musicPlatforms").then((res) => res.json()),
        ]);

        setAvailableData({
          artists: artistsRes.data || [],
          tags: tagsRes.data || [],
          collections: collectionsRes.data || [],
          platforms,
        });
      } catch (err) {
        console.error("Failed to load available data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [propAvailableData]);

  const updateField = (field: keyof MusicTrackFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const toggleId = (field: "artistIds" | "tagIds", id: number) => {
    const currentIds = formValues[field];
    const nextIds = currentIds.includes(id)
      ? currentIds.filter((item) => item !== id)
      : [...currentIds, id];
    updateField(field, nextIds);
  };

  const handleCreateArtist = async (name: string) => {
    try {
      const res = await fetch("/api/musicArtists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistName: name }),
      });
      if (res.ok) {
        const newArtist = await res.json();
        setAvailableData((prev) => ({
          ...prev,
          artists: [...prev.artists, newArtist],
        }));
        toggleId("artistIds", newArtist.id);
        if (propOnCreateArtist) propOnCreateArtist(newArtist);
      }
    } catch (err) {
      console.error("Failed to create artist:", err);
    }
  };

  const handleCreateTag = async (label: string) => {
    try {
      const res = await fetch("/api/musicTags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagLabel: label }),
      });
      if (res.ok) {
        const newTag = await res.json();
        setAvailableData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
        toggleId("tagIds", newTag.id);
        if (propOnCreateTag) propOnCreateTag(newTag);
      }
    } catch (err) {
      console.error("Failed to create tag:", err);
    }
  };

  const addLink = () => {
    updateField("links", [
      ...formValues.links,
      { musicPlatformId: 0, linkUrl: "" },
    ]);
  };

  const removeLink = (index: number) => {
    updateField(
      "links",
      formValues.links.filter((_, i) => i !== index),
    );
  };

  const updateLink = (
    index: number,
    field: "musicPlatformId" | "linkUrl",
    value: any,
  ) => {
    const updatedLinks = formValues.links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    updateField("links", updatedLinks);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (
      !formValues.trackTitle.trim() ||
      (!hideCollectionSelector && !formValues.trackCollectionId)
    ) {
      return;
    }
    onSubmit(formValues);
  };

  if (isLoadingData) return <p>Loading options...</p>;

  const content = (
    <>
      <header className={styles.header}>
        <h2>{title}</h2>
        {headerActions}
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label>Title:</label>
          <input
            type="text"
            value={formValues.trackTitle}
            onInput={(e) => updateField("trackTitle", e.currentTarget.value)}
            disabled={isSaving}
            placeholder="Enter track title..."
          />
        </div>

        {!hideCollectionSelector && (
          <SearchableMultiSelect
            label="Collection"
            placeholder="Search collections..."
            availableOptions={availableData.collections}
            selectedIds={formValues.trackCollectionId
              ? [formValues.trackCollectionId]
              : []}
            onToggleId={(id) =>
              updateField(
                "trackCollectionId",
                formValues.trackCollectionId === id ? null : id,
              )}
            itemLabelKey="collectionTitle"
            disabled={isSaving}
          />
        )}

        <SearchableMultiSelect
          label="Artists"
          placeholder="Search artists..."
          availableOptions={availableData.artists}
          selectedIds={formValues.artistIds}
          onToggleId={(id) => toggleId("artistIds", id)}
          onCreate={handleCreateArtist}
          itemLabelKey="artistName"
          disabled={isSaving}
        />

        <SearchableMultiSelect
          label="Tags"
          placeholder="Search tags..."
          availableOptions={availableData.tags}
          selectedIds={formValues.tagIds}
          onToggleId={(id) => toggleId("tagIds", id)}
          onCreate={handleCreateTag}
          itemLabelKey="tagLabel"
          disabled={isSaving}
        />

        <div className={styles.linksContainer}>
          <h3>Links</h3>
          <div className={styles.linksList}>
            {formValues.links.map((link, index) => (
              <div key={index} className={styles.linkRow}>
                <select
                  value={link.musicPlatformId}
                  onChange={(e) =>
                    updateLink(
                      index,
                      "musicPlatformId",
                      Number(e.currentTarget.value),
                    )}
                  disabled={isSaving}
                >
                  <option value={0}>Select Platform...</option>
                  {availableData.platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.platformLabel}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={link.linkUrl}
                  onInput={(e) =>
                    updateLink(index, "linkUrl", e.currentTarget.value)}
                  disabled={isSaving}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() =>
                    removeLink(index)}
                  disabled={isSaving}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLink}
            disabled={isSaving}
            className={styles.addButton}
          >
            + Add Link
          </button>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isSaving || !formValues.trackTitle ||
              (!hideCollectionSelector && !formValues.trackCollectionId)}
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
          {onCancel
            ? (
              <button
                type="button"
                onClick={onCancel}
                className={styles.cancelLink}
              >
                Cancel
              </button>
            )
            : <a href="/musicTracks" className={styles.cancelLink}>Cancel</a>}
        </div>
      </form>
    </>
  );

  if (isOverlay) {
    return (
      <section className={styles.trackFormOverlay}>
        <div className={styles.trackFormContent}>
          {content}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      {content}
    </section>
  );
};

export const AddMusicTrackForm = () => {
  const { route } = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (values: MusicTrackFormValues) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/musicTracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) route("/musicTracks");
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MusicTrackFormBase
      title="Add New Track"
      submitLabel="Create Track"
      initialValues={defaultFormValues}
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
};

export const EditMusicTrackForm = ({ id }: { id: string }) => {
  const { route } = useLocation();
  const [initialValues, setInitialValues] = useState<
    MusicTrackFormValues | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/musicTracks/${id}`)
      .then((res) => res.json())
      .then((track) => {
        setInitialValues({
          id: track.id,
          trackTitle: track.trackTitle,
          trackCollectionId: track.trackCollectionId,
          artistIds: track.artists?.map((a: any) => a.id) || [],
          tagIds: track.tags?.map((t: any) => t.id) || [],
          links: track.links?.map((l: any) => ({
            musicPlatformId: l.musicPlatformId,
            linkUrl: l.linkUrl,
          })) || [],
        });
      })
      .catch((err) => console.error("Load failed:", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (values: MusicTrackFormValues) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicTracks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) route("/musicTracks");
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/musicTracks/${id}`, {
        method: "DELETE",
      });
      if (response.ok) route("/musicTracks");
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!initialValues) return <p>Track not found.</p>;

  return (
    <MusicTrackFormBase
      title="Edit Track"
      submitLabel="Update Track"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      isSaving={isSaving}
      headerActions={
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className={styles.deleteButton}
        >
          Delete Track
        </button>
      }
    />
  );
};
