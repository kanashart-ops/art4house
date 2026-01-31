export const API_BASE_URL = "https://artforhouse.by";
export const GALLERY_URL = `${API_BASE_URL}/api/mobile-gallery`;

export type MobileArtItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

export async function fetchMobileGallery(): Promise<MobileArtItem[]> {
  const res = await fetch(GALLERY_URL);
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return (await res.json()) as MobileArtItem[];
}
