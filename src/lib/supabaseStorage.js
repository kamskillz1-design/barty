import { supabase } from "@/api/base44Client";

const STORAGE_BUCKET_CANDIDATES = [
  "listing-images",
  "listings",
  "images",
  "public",
];

const sanitizeFileName = (name) =>
  (name || "upload")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function uploadListingImage(file) {
  if (!(file instanceof File)) {
    throw new Error("A valid image file is required.");
  }

  const fileName = sanitizeFileName(file.name);
  const objectPath = `listings/${crypto.randomUUID()}-${fileName}`;
  const failures = [];

  for (const bucket of STORAGE_BUCKET_CANDIDATES) {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      failures.push(`${bucket}: ${uploadError.message}`);
      continue;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

    if (data?.publicUrl) {
      try {
        const response = await fetch(data.publicUrl, { method: "HEAD" });

        if (response.ok) {
          return {
            file_url: data.publicUrl,
            bucket,
            path: objectPath,
          };
        }

        failures.push(`${bucket}: public URL check returned ${response.status}`);
      } catch (error) {
        failures.push(`${bucket}: public URL check failed (${error.message})`);
      }
    }
  }

  throw new Error(
    `Image upload failed. Configure any one of these public Supabase storage buckets: ${STORAGE_BUCKET_CANDIDATES.join(
      ", "
    )}. Attempted buckets: ${failures.join(" | ")}`
  );
}
