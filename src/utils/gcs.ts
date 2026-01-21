// GCS (Google Cloud Storage) upload utility
// Uploads images through the backend API which handles GCS storage

import { buildApiUrl } from '../config/api';

export interface GCSUploadResult {
  url: string;
  objectKey: string;
  originalName?: string;
  originalUrl?: string;
  size?: number;
}

export interface GCSImage {
  url: string;
  objectKey?: string;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  return token;
}

/**
 * Upload a single file to GCS via backend
 */
export async function uploadToGCS(
  file: File,
  folder: string = 'uploads'
): Promise<GCSUploadResult> {
  const token = getAuthToken();
  
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const response = await fetch(buildApiUrl('api/upload/image'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload image');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Upload multiple files to GCS via backend
 */
export async function uploadMultipleToGCS(
  files: File[],
  folder: string = 'uploads',
  onProgress?: (completed: number, total: number) => void
): Promise<GCSUploadResult[]> {
  const token = getAuthToken();
  
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  formData.append('folder', folder);

  const response = await fetch(buildApiUrl('api/upload/images'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload images');
  }

  const result = await response.json();
  onProgress?.(files.length, files.length);
  return result.data;
}

/**
 * Upload an image from URL to GCS (for scraped images)
 */
export async function uploadUrlToGCS(
  imageUrl: string,
  folder: string = 'uploads'
): Promise<GCSUploadResult> {
  const token = getAuthToken();

  const response = await fetch(buildApiUrl('api/upload/url'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: imageUrl, folder }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload image from URL');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Upload multiple images from URLs to GCS
 */
export async function uploadUrlsToGCS(
  imageUrls: string[],
  folder: string = 'uploads'
): Promise<{ uploaded: GCSUploadResult[]; errors?: { url: string; error: string }[] }> {
  const token = getAuthToken();

  const response = await fetch(buildApiUrl('api/upload/urls'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urls: imageUrls, folder }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload images from URLs');
  }

  const result = await response.json();
  return result.data;
}
