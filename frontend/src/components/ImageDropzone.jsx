import { useRef, useState } from 'react';
import { fileService } from '../api/propertyService';
import { resolveImageUrl } from '../utils/format';

/**
 * Drag-and-drop (or click-to-browse) image uploader.
 *
 * Single mode:   value is a string URL or '', onChange(url) fires on success.
 * Multiple mode: value is an array of URLs, onChange(urls) fires with the full list.
 */
export default function ImageDropzone({ value, onChange, multiple = false, label }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const urls = multiple ? (value || []) : value ? [value] : [];

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      if (multiple) {
        const uploaded = [];
        for (let i = 0; i < files.length; i++) {
          const url = await fileService.upload(files[i], (pct) => setProgress(pct));
          uploaded.push(url);
        }
        onChange([...(value || []), ...uploaded]);
      } else {
        const url = await fileService.upload(files[0], setProgress);
        onChange(url);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Try a smaller image (under 8MB).');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAt = (idx) => {
    if (multiple) {
      const next = [...urls];
      next.splice(idx, 1);
      onChange(next);
    } else {
      onChange('');
    }
  };

  return (
    <div className="field">
      {label && <label>{label}</label>}

      <div
        className={`dropzone ${dragOver ? 'dropzone-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <span className="dropzone-text">Uploading{progress ? ` ${progress}%` : '\u2026'}</span>
        ) : (
          <span className="dropzone-text">
            Drag &amp; drop {multiple ? 'photos' : 'a photo'} here, or click to browse
          </span>
        )}
      </div>

      {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}

      {urls.length > 0 && (
        <div className="dropzone-preview-row">
          {urls.map((url, idx) => (
            <div className="dropzone-preview" key={url + idx}>
              <img src={resolveImageUrl(url)} alt="" />
              <button type="button" className="dropzone-remove" onClick={() => removeAt(idx)} aria-label="Remove image">
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
