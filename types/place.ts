// types/place.ts
export interface Place {
  id: string;
  name: string;
  desc?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PlaceFormValues = Pick<Place, 'name' | 'desc'>;
