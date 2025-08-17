export class Category {
  id: string;
  name: string;
  masteryScore: number;
  featured: boolean;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;

  constructor(id: string, name: string, masteryScore: number = 0, featured: boolean = false, icon: string = '', color: string = '') {
    this.id = id;
    this.name = name;
    this.masteryScore = masteryScore;
    this.featured = featured;
    this.icon = icon;
    this.color = color;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
}
