"use client";

import { useEffect, useMemo, useState } from "react";

export default function PhotoUploader({
  files,
  setFiles,
  max = 12
}: {
  files: File[];
  setFiles: (files: File[]) => void;
  max?: number;
}) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => next.forEach(URL.revokeObjectURL);
  }, [files]);

  function move(i: number, dir: -1 | 1) {
    const next = [...files];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setFiles(next);
  }

  function remove(i: number) {
    setFiles(files.filter((_, index) => index !== i));
  }

  return (
    <div>
      <input
        className="input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          const selected = Array.from(e.target.files || []);
          const allowed = new Set(['image/jpeg','image/png','image/webp']);
          const valid = selected.filter((f) => allowed.has(f.type) && f.size <= 10 * 1024 * 1024);
          setFiles([...files, ...valid].slice(0, max));
          e.currentTarget.value = "";
        }}
      />
      <div className="help">Add up to {max} photos. JPG, PNG, or WebP, up to 10 MB each. The first photo becomes the cover.</div>
      {!!files.length && (
        <div className="photo-grid">
          {files.map((file, i) => (
            <div className="photo-item" key={`${file.name}-${i}`}>
              <img src={urls[i]} alt={`Preview ${i + 1}`} />
              <div className="photo-actions">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>←</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === files.length - 1}>→</button>
                <button type="button" className="photo-remove" onClick={() => remove(i)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
