"use client";

import { useRef, useState } from "react";

// Shrink big photos in the browser before upload so any phone photo works
// (Cloudinary's free plan rejects very large files) and the site stays fast.
// Only downscales; never enlarges. Falls back to the original file if the
// image can't be processed (e.g. an unusual format).
async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image", // respect phone photo rotation
    });
    const maxDim = 1600;
    let { width, height } = bitmap;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    // Use the compressed version only if it actually came out smaller.
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

// Photo picker for the admin form. On a phone this opens the camera or gallery.
// The chosen photo uploads directly to Cloudinary; the resulting URL is stored
// in a hidden input (name defaults to "imageUrl") that the form submits.
export default function ImageUpload({
  name = "imageUrl",
  defaultUrl = "",
}: {
  name?: string;
  defaultUrl?: string;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError("");
    try {
      // 1. Shrink the photo in the browser so any size works.
      const photo = await compressImage(file);

      // 2. Ask our server for a signed upload.
      const signRes = await fetch("/api/sign-upload", { method: "POST" });
      if (!signRes.ok) throw new Error("Could not start upload.");
      const { timestamp, signature, apiKey, cloudName, folder } =
        await signRes.json();

      // 3. Upload the photo straight to Cloudinary.
      const form = new FormData();
      form.append("file", photo, "photo.jpg");
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      const data = await upRes.json();
      if (!upRes.ok || !data.secure_url) {
        throw new Error(data?.error?.message ?? "Upload failed.");
      }

      setUrl(data.secure_url);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  return (
    <div className="space-y-2">
      {/* The value the form actually submits. */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Footwear photo"
          className="h-40 w-40 rounded-lg border border-cream-dark object-cover"
        />
      ) : (
        <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-cream-dark bg-cream-dark/30 text-sm text-ink-soft">
          No photo yet
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={status === "uploading"}
          className="rounded-lg border border-gold bg-card px-4 py-2 text-sm font-medium text-gold-dark hover:bg-gold hover:text-ink disabled:opacity-60"
        >
          {status === "uploading"
            ? "Uploading…"
            : url
              ? "Change photo"
              : "Take / choose photo"}
        </button>
        {url && status === "idle" && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
