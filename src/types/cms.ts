export type GalleryItem = {
  id: string;
  title: string;
  category: 'Campus' | 'Academics' | 'Events' | string;
  image: string;
  order: number;
  imgClass?: string;
  createdAt?: number;
};

export type NewsItem = {
  id: string;
  category: string;
  date: string;
  title: string;
  desc: string;
  link: string;
  href: string;
  external: boolean;
  image: string;
  order: number;
  createdAt?: number;
};

export type SiteSettings = {
  shortName: string;
  fullName: string;
  tagline: string;
  established: number;
  campusSince: number;
  principal: string;
  chiefProctor: string;
  addressLine: string;
  city: string;
  phone: string;
  email: string;
  facebookUrl: string;
  facebookPhotosUrl: string;
  hedAdmissionUrl: string;
  hedCollegeUrl: string;
  wikipediaUrl: string;
  mapQuery: string;
  vision: string;
  heroImage?: string;
  principalImage?: string;
  aboutImage?: string;
  chiefProctorImage?: string;
};

export const GALLERY_CATEGORIES = ['Campus', 'Academics', 'Events'] as const;
