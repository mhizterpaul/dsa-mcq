export class Category {
  id: string;
  name: string;
  masteryScore: number;
  featured: boolean;
  icon: string;
  color: string;

  constructor(id: string, name: string, masteryScore: number = 0, featured: boolean = false, icon: string = '', color: string = '') {
    this.id = id;
    this.name = name;
    this.masteryScore = masteryScore;
    this.featured = featured;
    this.icon = icon;
    this.color = color;
  }
}
