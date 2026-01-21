// Cloudinary configuration for direct uploads
const CLOUDINARY_CLOUD_NAME = 'dqyizevct';
const CLOUDINARY_UPLOAD_PRESET = 'leepi_unsigned'; // You'll need to create this unsigned preset in Cloudinary

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
}

export interface CloudinaryImage {
  publicId: string;
  url: string;
}

/**
 * Upload a file directly to Cloudinary from the frontend
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'leepi'
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload image to Cloudinary');
  }

  return response.json();
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string = 'leepi',
  onProgress?: (completed: number, total: number) => void
): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await uploadToCloudinary(files[i], folder);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}

/**
 * Upload an image URL to Cloudinary (for scraped images)
 */
export async function uploadUrlToCloudinary(
  imageUrl: string,
  folder: string = 'leepi'
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload image to Cloudinary');
  }

  return response.json();
}

/**
 * Get Cloudinary config for reference
 */
export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
};
