"use client";

import { useRef, useState } from "react";

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
      // 1. Ask our server for a signed upload.
      const signRes = await fetch("/api/sign-upload", { method: "POST" });
      if (!signRes.ok) throw new Error("Could not start upload.");
      const { timestamp, signature, apiKey, cloudName, folder } =
        await signRes.json();

      // 2. Upload the photo straight to Cloudinary.
      const form = new FormData();
      form.append("file", file);
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
