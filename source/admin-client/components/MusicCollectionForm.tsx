import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { SearchableMultiSelect } from "./SearchableMultiSelect.tsx";
import {
  MusicTrackAvailableData,
  MusicTrackFormBase,
  MusicTrackFormValues,
} from "./MusicTrackForm.tsx";
import styles from "./Form.module.scss";

interface FormValues {
  collectionTitle: string;
  collectionCoverUrl: string;
  collectionNotes: string;
  collectionDateYear: number | undefined;
  collectionDateMonth: number | undefined;
  musicArtistIds: number[];
  musicTagIds: number[];
  musicContextIds: number[];
  musicLinkIds: number[];
  tracks: MusicTrackFormValues[];
  collectionKindId: number | null;
  musicLinks: { musicPlatformId: number; linkUrl: string }[];
}

interface AvailableData {
  artists: { id: number; artistName: string }[];
  tags: { id: number; tagLabel: string }[];
  contexts: { id: number; contextLabel: string }[];
  kinds: { id: number; collectionLabel: string }[];
  platforms: { id: number; platformLabel: string }[];
}

const defaultFormValues: FormValues = {
  collectionTitle: "",
  collectionCoverUrl: "",
  collectionNotes: "",
  collectionDateYear: undefined,
  collectionDateMonth: undefined,
  musicArtistIds: [],
  musicTagIds: [],
  musicContextIds: [],
  musicLinkIds: [],
  tracks: [],
  collectionKindId: null,
  musicLinks: [],
};

const MusicCollectionFormBase = ({
  title,
  submitLabel,
  initialValues,
  onSubmit,
  isSaving,
  headerActions,
}: {
  title: string;
  submitLabel: string;
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void;
  isSaving: boolean;
  headerActions?: ComponentChildren;
}) => {
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [availableData, setAvailableData] = useState<AvailableData>({
    artists: [],
    tags: [],
    contexts: [],
    kinds: [],
    platforms: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Track Editing State
  const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(
    null,
  );
  const [isCreatingTrack, setIsCreatingTrack] = useState(false);

  const isTrackMode = isCreatingTrack || editingTrackIndex !== null;

  useEffect(() => {
    if (isTrackMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isTrackMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artists, tags, contexts, kinds, platforms] = await Promise.all([
          fetch("/api/musicArtists").then((res) => res.json()),
          fetch("/api/musicTags").then((res) => res.json()),
          fetch("/api/musicContexts").then((res) => res.json()),
          fetch("/api/musicCollectionKinds").then((res) => res.json()),
          fetch("/api/musicPlatforms").then((res) => res.json()),
        ]);

        setAvailableData({ artists, tags, contexts, kinds, platforms });
      } catch (err) {
        console.error("Failed to load available data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const updateField = (field: keyof FormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const toggleId = (field: keyof FormValues, id: number) => {
    const currentIds = formValues[field] as number[];
    const nextIds = currentIds.includes(id)
      ? currentIds.filter((item) => item !== id)
      : [...currentIds, id];
    updateField(field, nextIds);
  };

  const createArtist = async (name: string) => {
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
        return newArtist;
      }
    } catch (err) {
      console.error("Failed to create artist:", err);
    }
    return null;
  };

  const createCollectionArtist = async (name: string) => {
    const newArtist = await createArtist(name);
    if (newArtist) {
      toggleId("musicArtistIds", newArtist.id);
    }
  };

  const createTag = async (label: string) => {
    try {
      const res = await fetch("/api/musicTags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagLabel: label }),
      });
      if (res.ok) {
        const newTag = await res.json();
        setAvailableData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
        return newTag;
      }
    } catch (err) {
      console.error("Failed to create tag:", err);
    }
    return null;
  };

  const createCollectionTag = async (label: string) => {
    const newTag = await createTag(label);
    if (newTag) {
      toggleId("musicTagIds", newTag.id);
    }
  };

  const addLink = () => {
    setFormValues((prev) => ({
      ...prev,
      musicLinks: [...prev.musicLinks, { musicPlatformId: 0, linkUrl: "" }],
    }));
  };

  const removeLink = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      musicLinks: prev.musicLinks.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (
    index: number,
    field: "musicPlatformId" | "linkUrl",
    value: any,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      musicLinks: prev.musicLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  // Track Management
  const handleEditTrack = (index: number) => {
    setEditingTrackIndex(index);
    setIsCreatingTrack(false);
  };

  const handleCreateTrack = () => {
    setIsCreatingTrack(true);
    setEditingTrackIndex(null);
  };

  const handleSaveTrack = (trackValues: MusicTrackFormValues) => {
    if (isCreatingTrack) {
      setFormValues((prev) => ({
        ...prev,
        tracks: [...prev.tracks, trackValues],
      }));
    } else if (editingTrackIndex !== null) {
      setFormValues((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t, i) =>
          i === editingTrackIndex ? trackValues : t
        ),
      }));
    }
    setEditingTrackIndex(null);
    setIsCreatingTrack(false);
  };

  const handleCancelTrack = () => {
    setEditingTrackIndex(null);
    setIsCreatingTrack(false);
  };

  const handleRemoveTrack = (index: number) => {
    if (confirm("Are you sure you want to remove this track?")) {
      setFormValues((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (
      !formValues.collectionTitle.trim() || !formValues.collectionKindId
    ) {
      return;
    }
    onSubmit(formValues);
  };

  if (isLoadingData) return <p>Loading options...</p>;

  const currentTrackValues = isCreatingTrack
    ? {
      trackTitle: "",
      artistIds: [],
      tagIds: [],
      links: [],
      trackCollectionId: null,
    }
    : (editingTrackIndex !== null
      ? formValues.tracks[editingTrackIndex]
      : null);

  const trackAvailableData: MusicTrackAvailableData = {
    artists: availableData.artists,
    tags: availableData.tags,
    platforms: availableData.platforms,
    collections: [], // Not needed in overlay
  };

  return (
    <section className={styles.container}>
      {isTrackMode && currentTrackValues && (
        <div className={styles.formOverlay}>
          <MusicTrackFormBase
            title={editingTrackIndex !== null ? "Edit Track" : "Add Track"}
            submitLabel="Save Track"
            initialValues={currentTrackValues}
            onSubmit={handleSaveTrack}
            onCancel={handleCancelTrack}
            isSaving={false}
            availableData={trackAvailableData}
            hideCollectionSelector={true}
            isOverlay={true}
            onCreateArtist={(artist) =>
              setAvailableData((prev) => ({
                ...prev,
                artists: [...prev.artists, artist],
              }))}
            onCreateTag={(tag) =>
              setAvailableData((prev) => ({
                ...prev,
                tags: [...prev.tags, tag],
              }))}
          />
        </div>
      )}
      <header className={styles.header}>
        <h2>{title}</h2>
        {headerActions}
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label>Cover URL:</label>
          <input
            type="text"
            value={formValues.collectionCoverUrl}
            onInput={(e) =>
              updateField("collectionCoverUrl", e.currentTarget.value)}
            disabled={isSaving}
            placeholder="Enter cover URL..."
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Title:</label>
          <input
            type="text"
            value={formValues.collectionTitle}
            onInput={(e) =>
              updateField("collectionTitle", e.currentTarget.value)}
            disabled={isSaving}
            placeholder="Enter title..."
          />
        </div>

        <SearchableMultiSelect
          label="Artists"
          placeholder="Search artists to add..."
          availableOptions={availableData.artists}
          selectedIds={formValues.musicArtistIds}
          onToggleId={(id) => toggleId("musicArtistIds", id)}
          onCreate={createCollectionArtist}
          itemLabelKey="artistName"
          disabled={isSaving}
        />

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label>Year:</label>
            <input
              type="number"
              value={formValues.collectionDateYear}
              onInput={(e) =>
                updateField(
                  "collectionDateYear",
                  Number(e.currentTarget.value),
                )}
              disabled={isSaving}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>Month:</label>
            <input
              type="number"
              min="1"
              max="12"
              value={formValues.collectionDateMonth}
              onInput={(e) =>
                updateField(
                  "collectionDateMonth",
                  Number(e.currentTarget.value),
                )}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label>Context:</label>
          <div className={styles.contextContainer}>
            {availableData.contexts.length === 0 && (
              <p>No contexts found. Please add contexts first.</p>
            )}
            {availableData.contexts.map((ctx) => (
              <label key={ctx.id} className={styles.contextLabel}>
                <input
                  type="checkbox"
                  checked={formValues.musicContextIds.includes(ctx.id)}
                  onChange={() =>
                    toggleId("musicContextIds", ctx.id)}
                  disabled={isSaving}
                />
                {ctx.contextLabel}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label>Kind:</label>
          <select
            value={formValues.collectionKindId || ""}
            onChange={(e) =>
              updateField(
                "collectionKindId",
                e.currentTarget.value ? Number(e.currentTarget.value) : null,
              )}
            disabled={isSaving}
          >
            <option value="">Select a kind...</option>
            {availableData.kinds.map((kind) => (
              <option key={kind.id} value={kind.id}>
                {kind.collectionLabel}
              </option>
            ))}
          </select>
        </div>

        <SearchableMultiSelect
          label="Tags"
          placeholder="Search tags to add..."
          availableOptions={availableData.tags}
          selectedIds={formValues.musicTagIds}
          onToggleId={(id) => toggleId("musicTagIds", id)}
          onCreate={createCollectionTag}
          itemLabelKey="tagLabel"
          disabled={isSaving}
        />

        <div className={styles.fieldGroup}>
          <label>Notes:</label>
          <textarea
            value={formValues.collectionNotes}
            onInput={(e) =>
              updateField("collectionNotes", e.currentTarget.value)}
            disabled={isSaving}
            placeholder="Enter notes..."
            rows={4}
          />
        </div>

        <div className={styles.linksContainer}>
          <h3>Links</h3>
          <div className={styles.linksList}>
            {formValues.musicLinks.map((link, index) => (
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

        <div className={styles.tracksContainer}>
          <h3>Feature Tracks</h3>
          <div className={styles.tracksList}>
            {formValues.tracks.map((track, index) => (
              <div key={index} className={styles.trackRow}>
                <div className={styles.trackInfo}>
                  <strong>{track.trackTitle}</strong>
                  <div className={styles.trackMeta}>
                    {track.artistIds.length > 0 && (
                      <div className={styles.trackArtists}>
                        {track.artistIds
                          .map((id) =>
                            availableData.artists.find((a) =>
                              a.id === id
                            )
                              ?.artistName
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                    {track.tagIds.length > 0 && (
                      <div className={styles.trackTags}>
                        {track.tagIds
                          .map((id) =>
                            availableData.tags.find((t) =>
                              t.id === id
                            )?.tagLabel
                          )
                          .filter(Boolean)
                          .map((label) => (
                            <span key={label} className={styles.trackTag}>
                              {label}
                            </span>
                          ))}
                      </div>
                    )}
                    {track.links.length > 0 && (
                      <div className={styles.trackLinks}>
                        {track.links.map((link, idx) => {
                          const platform = availableData.platforms.find(
                            (p) =>
                              p.id === link.musicPlatformId,
                          );
                          if (!platform) return null;
                          return (
                            <span key={idx}>
                              {idx > 0 && " | "}
                              <a
                                href={link.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {platform.platformLabel}
                              </a>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleEditTrack(index)}
                    disabled={isSaving}
                    style={{ marginRight: "5px" }}
                    className={styles.secondaryAction}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTrack(index)}
                    disabled={isSaving}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreateTrack}
            disabled={isSaving}
            className={styles.addButton}
          >
            + Add Track
          </button>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isSaving || !formValues.collectionTitle ||
              !formValues.collectionCoverUrl || !formValues.collectionKindId}
            style={{ padding: "10px 20px" }}
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <a href="/musicCollections" className={styles.cancelLink}>Cancel</a>
        </div>
      </form>
    </section>
  );
};

export const AddMusicCollectionForm = () => {
  const { route } = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (formValues: FormValues) => {
    setIsSaving(true);
    try {
      // Filter out empty links for collection
      const filteredLinks = formValues.musicLinks.filter((l) =>
        l.musicPlatformId !== 0 && l.linkUrl.trim() !== ""
      );

      // Filter out empty links for tracks
      const filteredTracks = formValues.tracks.map((track) => ({
        ...track,
        links: track.links.filter((l) =>
          l.musicPlatformId !== 0 && l.linkUrl.trim() !== ""
        ),
      }));

      const submitData = {
        ...formValues,
        musicLinks: filteredLinks,
        tracks: filteredTracks,
      };

      const response = await fetch("/api/musicCollections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        route("/musicCollections");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MusicCollectionFormBase
      title="Add New Collection"
      submitLabel="Create Collection"
      initialValues={defaultFormValues}
      onSubmit={handleSubmit}
      isSaving={isSaving}
    />
  );
};

export const EditMusicCollectionForm = ({ id }: { id: string }) => {
  const { route } = useLocation();
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/musicCollections/${id}`)
      .then((res) => res.json())
      .then((collection) => {
        setInitialValues({
          collectionTitle: collection.collectionTitle,
          collectionCoverUrl: collection.collectionCoverUrl,
          collectionNotes: collection.collectionNotes || "",
          collectionDateYear: collection.collectionDateYear,
          collectionDateMonth: collection.collectionDateMonth,
          musicArtistIds: collection.artists?.map((a: any) => a.id) || [],
          musicTagIds: collection.tags?.map((t: any) => t.id) || [],
          musicContextIds: collection.contexts?.map((c: any) => c.id) || [],
          musicLinkIds: collection.links?.map((l: any) => l.id) || [],
          tracks: collection.tracks?.map((tr: any) => ({
            id: tr.id,
            trackTitle: tr.trackTitle,
            artistIds: tr.artists?.map((a: any) => a.id) || [],
            tagIds: tr.tags?.map((t: any) => t.id) || [],
            links: tr.links?.map((l: any) => ({
              musicPlatformId: l.musicPlatformId,
              linkUrl: l.linkUrl,
            })) || [],
          })) || [],
          collectionKindId: collection.collectionKindId,
          musicLinks: collection.links?.map((l: any) => ({
            musicPlatformId: l.musicPlatformId,
            linkUrl: l.linkUrl,
          })) || [],
        });
      })
      .catch((err) => console.error("Failed to load collection:", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (formValues: FormValues) => {
    setIsSaving(true);
    try {
      const filteredLinks = formValues.musicLinks.filter((l) =>
        l.musicPlatformId !== 0 && l.linkUrl.trim() !== ""
      );

      const filteredTracks = formValues.tracks.map((track) => ({
        ...track,
        links: track.links.filter((l) =>
          l.musicPlatformId !== 0 && l.linkUrl.trim() !== ""
        ),
      }));

      const submitData = {
        ...formValues,
        musicLinks: filteredLinks,
        tracks: filteredTracks,
      };

      const response = await fetch(`/api/musicCollections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        route("/musicCollections");
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
      const response = await fetch(`/api/musicCollections/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        route("/musicCollections");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading collection...</p>;
  if (!initialValues) return <p>Collection not found.</p>;

  return (
    <MusicCollectionFormBase
      title="Edit Collection"
      submitLabel="Update Collection"
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
          Delete Collection
        </button>
      }
    />
  );
};
