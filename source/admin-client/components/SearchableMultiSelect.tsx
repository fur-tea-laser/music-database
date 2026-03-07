import { useState } from "preact/hooks";
import styles from "./SearchableMultiSelect.module.scss";

interface Option {
  id: number;
  [key: string]: any;
}

interface SearchableMultiSelectProps {
  label: string;
  placeholder: string;
  availableOptions: Option[];
  selectedIds: number[];
  onToggleId: (id: number) => void;
  itemLabelKey: string;
  disabled?: boolean;
  onCreate?: (value: string) => void;
}

export const SearchableMultiSelect = ({
  label,
  placeholder,
  availableOptions,
  selectedIds,
  onToggleId,
  itemLabelKey,
  disabled = false,
  onCreate,
}: SearchableMultiSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const options = Array.isArray(availableOptions) ? availableOptions : [];

  const filteredOptions = options.filter((option) =>
    option[itemLabelKey].toLowerCase().startsWith(searchTerm.toLowerCase()) &&
    !selectedIds.includes(option.id)
  );

  const selectedOptions = options.filter((option) =>
    selectedIds.includes(option.id)
  );

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}:</label>
      <div className={styles.selectedOptions}>
        {selectedOptions.length === 0 && (
          <span className={styles.noSelection}>
            No {label.toLowerCase()} selected.
          </span>
        )}
        {selectedOptions.map((option) => (
          <span
            key={option.id}
            className={styles.pill}
            style={{ background: "#e0e0e0" }}
          >
            {option[itemLabelKey]}
            <button
              type="button"
              onClick={() => onToggleId(option.id)}
              className={styles.removeButton}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          className={styles.input}
          onInput={(e) => {
            setSearchTerm(e.currentTarget.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowDropdown(false);
            }
            if (e.key === "Tab" && e.shiftKey) {
              setShowDropdown(false);
            }
          }}
          disabled={disabled}
        />
        {showDropdown && searchTerm && (
          <div className={styles.dropdown}>
            {filteredOptions.length === 0
              ? (
                <div className={styles.noMatch}>
                  No matching {label.toLowerCase()}
                </div>
              )
              : (
                filteredOptions.map((option, index) => (
                  <button
                    type="button"
                    key={option.id}
                    className={styles.optionButton}
                    onClick={() => {
                      onToggleId(option.id);
                      setSearchTerm("");
                      setShowDropdown(false);
                    }}
                    onKeyDown={(e) => {
                      const isLastOption = index === filteredOptions.length - 1;
                      const hasCreateButton = Boolean(onCreate && searchTerm);
                      if (
                        e.key === "Tab" && !e.shiftKey && isLastOption &&
                        !hasCreateButton
                      ) {
                        setShowDropdown(false);
                      }
                      if (e.key === "Escape") {
                        setShowDropdown(false);
                      }
                    }}
                  >
                    {option[itemLabelKey]}
                  </button>
                ))
              )}
            {onCreate && searchTerm && (
              <button
                type="button"
                className={styles.createButton}
                onClick={() => {
                  onCreate(searchTerm);
                  setSearchTerm("");
                  setShowDropdown(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Tab" && !e.shiftKey) {
                    setShowDropdown(false);
                  }
                  if (e.key === "Escape") {
                    setShowDropdown(false);
                  }
                }}
              >
                + Create "{searchTerm}"
              </button>
            )}
          </div>
        )}
      </div>
      {showDropdown && (
        <div
          onClick={() => setShowDropdown(false)}
          className={styles.overlay}
        />
      )}
    </div>
  );
};
