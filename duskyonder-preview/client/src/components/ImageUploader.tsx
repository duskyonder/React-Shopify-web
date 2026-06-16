import React, { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

interface ImageUploaderProps {
  section: string;
  slot: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  aspectRatio?: string; // e.g. "16/9", "3/4"
  label?: string;
}

export default function ImageUploader({
  section,
  slot,
  currentUrl,
  onUploaded,
  aspectRatio = "16/9",
  label = "Upload Image",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.theme.uploadImage.useMutation();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const result = await uploadMutation.mutateAsync({
          section,
          slot,
          base64,
          mimeType: file.type,
          originalName: file.name,
        });
        onUploaded(result.url);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="editor-image-upload"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: "pointer" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      {uploading ? (
        <div className="editor-image-uploading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Uploading...
        </div>
      ) : currentUrl ? (
        <div>
          <img
            src={currentUrl}
            alt="Uploaded"
            className="editor-image-preview"
            style={{ aspectRatio }}
          />
          <p style={{ fontSize: "0.75rem", color: "#888", margin: 0 }}>Click to replace</p>
        </div>
      ) : (
        <div className="editor-image-placeholder">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>{label}</span>
          <span style={{ fontSize: "0.7rem", color: "#bbb" }}>Click or drag & drop</span>
        </div>
      )}
    </div>
  );
}
