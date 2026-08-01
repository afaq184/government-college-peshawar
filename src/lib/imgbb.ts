const IMGBB_API_KEY = 'c98e57ad2f31f407f08acbe5a87429b6';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export type ImgBBUploadResult = {
  url: string;
  displayUrl: string;
  deleteUrl?: string;
};

/** Upload an image file to ImgBB and return hosted URLs. */
export async function uploadToImgBB(file: File): Promise<ImgBBUploadResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);
  formData.append('name', file.name.replace(/\.[^.]+$/, '') || 'upload');

  const res = await fetch(IMGBB_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json?.success || !json?.data?.url) {
    throw new Error(json?.error?.message || 'Image upload failed');
  }

  return {
    url: json.data.url as string,
    displayUrl: (json.data.display_url as string) || (json.data.url as string),
    deleteUrl: json.data.delete_url as string | undefined,
  };
}
