export interface Category {
  id: string;
  name: string;
  masteryScore: number;
  featured: boolean;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export const createCategory = (
  id: string,
  name: string,
  masteryScore: number = 0,
  featured: boolean = false,
  icon: string = '',
  color: string = ''
): Category => ({
  id,
  name,
  masteryScore,
  featured,
  icon,
  color,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});