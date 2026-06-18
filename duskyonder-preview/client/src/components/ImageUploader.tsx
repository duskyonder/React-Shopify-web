import React, { useRef, useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface ShopifyFile {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  createdAt: string;
}

interface ImageUploaderProps {
  section: string;
  slot: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  onClear?: () => void;
  aspectRatio?: string;
  label?: string;
}

export default function ImageUploader({
  section,
  slot,
  currentUrl,
  onUploaded,
  onClear,
  aspectRatio = "16/9",
  label = "Upload Image",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pagination state
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allFiles, setAllFiles] = useState<ShopifyFile[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const uploadMutation = trpc.theme.uploadImage.useMutation();

  const {
    data: filesData,
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = trpc.theme.listFiles.useQuery(
    { first: 60, after: cursor, query: debouncedQuery || undefined },
    { enabled: pickerOpen }
  );

  // When filesData changes, accumulate results
  useEffect(() => {
    if (!filesData) return;
    if (cursor === undefined) {
      // Fresh load or search reset
      setAllFiles(filesData.files as ShopifyFile[]);
    } else {
      // Load more appended
      setAllFiles(prev => [...prev, ...(filesData.files as ShopifyFile[])]);
    }
    setLoadingMore(false);
  }, [filesData]);

  // Reset when picker opens or search changes
  useEffect(() => {
    if (pickerOpen) {
      setCursor(undefined);
      setAllFiles([]);
    }
  }, [pickerOpen]);

  useEffect(() => {
    setCursor(undefined);
    setAllFiles([]);
  }, [debouncedQuery]);

  const handleLoadMore = () => {
    if (!filesData?.pageInfo?.hasNextPage || !filesData?.pageInfo?.endCursor)
      return;
    setLoadingMore(true);
    setCursor(filesData.pageInfo.endCursor);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async e => {
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
        // Refresh list after upload
        if (pickerOpen) {
          setCursor(undefined);
          setAllFiles([]);
          refetchFiles();
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
    }
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 400);
  };

  const handleSelectFromLibrary = (file: ShopifyFile) => {
    onUploaded(file.url);
    setPickerOpen(false);
  };

  return (
    <>
      {/* Trigger area */}
      <div
        className="editor-image-upload"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => setPickerOpen(true)}
        style={{ cursor: "pointer" }}
      >
        {uploading ? (
          <div className="editor-image-uploading">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Uploading to Shopify...
          </div>
        ) : currentUrl ? (
          <div style={{ position: "relative" }}>
            <img
              src={currentUrl}
              alt="Uploaded"
              className="editor-image-preview"
              style={{ aspectRatio }}
            />
            <p style={{ fontSize: "0.75rem", color: "#888", margin: 0 }}>
              Click to change
            </p>
            {onClear && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onClear();
                }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(220,38,38,0.85)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                }}
                title="Remove image"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div className="editor-image-placeholder">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{label}</span>
            <span style={{ fontSize: "0.7rem", color: "#bbb" }}>
              Click to open Shopify Files
            </span>
          </div>
        )}
      </div>

      {/* Hidden local file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleLocalFileChange}
        style={{ display: "none" }}
      />

      {/* Shopify Files Picker Modal */}
      {pickerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setPickerOpen(false);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "min(900px, 95vw)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontWeight: 600, fontSize: "1rem", color: "#111" }}
                >
                  Shopify Files
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "#888", marginTop: 2 }}
                >
                  {allFiles.length > 0
                    ? `${allFiles.length} images loaded`
                    : "Select an existing image or upload a new one"}
                </div>
              </div>
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: "0.85rem",
                  width: 200,
                  outline: "none",
                }}
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                style={{
                  background: uploading ? "#ccc" : "#0D3D2B",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "7px 14px",
                  fontSize: "0.85rem",
                  cursor: uploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                {uploading ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="animate-spin"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload new
                  </>
                )}
              </button>
              <button
                onClick={() => setPickerOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "#666",
                  borderRadius: 4,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {filesLoading && allFiles.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 200,
                    color: "#888",
                    gap: 8,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Loading Shopify Files...
                </div>
              ) : allFiles.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 200,
                    color: "#aaa",
                    gap: 8,
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={{ fontSize: "0.9rem" }}>
                    {debouncedQuery
                      ? `No images found for "${debouncedQuery}"`
                      : "No images in Shopify Files yet"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#bbb" }}>
                    Click "Upload new" to add images
                  </span>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {allFiles.map(file => (
                      <button
                        key={file.id}
                        onClick={() => handleSelectFromLibrary(file)}
                        style={{
                          border:
                            currentUrl === file.url
                              ? "2px solid #0D3D2B"
                              : "2px solid transparent",
                          borderRadius: 8,
                          overflow: "hidden",
                          cursor: "pointer",
                          background: "#f5f5f5",
                          padding: 0,
                          position: "relative",
                          transition: "border-color 0.15s",
                        }}
                        title={file.alt || file.url.split("/").pop()}
                      >
                        <img
                          src={file.url}
                          alt={file.alt}
                          style={{
                            width: "100%",
                            aspectRatio: "1",
                            objectFit: "cover",
                            display: "block",
                          }}
                          loading="lazy"
                        />
                        {currentUrl === file.url && (
                          <div
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "#0D3D2B",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Load More */}
                  {filesData?.pageInfo?.hasNextPage && (
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        style={{
                          background: loadingMore ? "#eee" : "#0D3D2B",
                          color: loadingMore ? "#999" : "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 20px",
                          fontSize: "0.85rem",
                          cursor: loadingMore ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {loadingMore ? (
                          <>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="animate-spin"
                            >
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Loading...
                          </>
                        ) : (
                          "Load more images"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
