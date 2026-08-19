import React, { useRef, useState } from 'react';
import { UploadService } from '../services/uploadService';
import { extractErrorMessage } from '../services/errorUtils';

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png'];

export default function PosterDropzone({ value, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('Hanya file JPG/PNG yang diizinkan.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Ukuran file maksimal 2 MB.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await UploadService.uploadPoster(file);
      onUploaded?.(url);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="font-mono text-[10.5px] tracking-[.06em] uppercase text-muted mb-1.5">Poster lomba</div>

      {value ? (
        <div className="relative">
          <img src={value} alt="Preview poster" className="w-full max-h-[220px] object-cover rounded-[3px] border-[1.5px] border-navy" />
          <button
            type="button"
            onClick={() => onUploaded?.('')}
            title="Hapus poster"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-cream border-[1.5px] border-navy flex items-center justify-center text-xs cursor-pointer hover:bg-red hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
          className={
            'border-[1.5px] border-dashed border-navy rounded-[3px] p-6 text-center cursor-pointer transition-colors ' +
            (dragOver ? 'bg-navy/[.06]' : 'bg-navy/[.02] hover:bg-navy/[.04]')
          }
        >
          <div className="text-[22px] mb-1">🖼</div>
          <div className="text-[13.5px] font-medium">
            {uploading ? 'Mengunggah…' : (<>Seret poster ke sini atau <span className="underline">pilih file</span></>)}
          </div>
          <div className="font-mono text-[11px] text-muted mt-1">JPG/PNG · maks 2 MB · rasio 4:5 disarankan</div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <div className="text-red text-xs mt-1.5">{error}</div>}
    </div>
  );
}
