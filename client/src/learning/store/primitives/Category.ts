export class Category {
  id: string;
  name: string;
  masteryScore: number;

  constructor(id: string, name: string, masteryScore: number = 0) {
    this.id = id;
    this.name = name;
    this.masteryScore = masteryScore;
  }
}
