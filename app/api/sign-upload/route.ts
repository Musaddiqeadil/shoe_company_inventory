import { v2 as cloudinary } from "cloudinary";

// Returns a short-lived signature so the browser can upload an image directly
// to Cloudinary without ever exposing the API secret. The photo itself goes
// straight from the phone to Cloudinary (not through this server).
export async function POST() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      { error: "Cloudinary is not configured. See README." },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "shoe-company";

  // Sign exactly the params the browser will send (besides file/api_key).
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret
  );

  return Response.json({ timestamp, signature, apiKey, cloudName, folder });
}
