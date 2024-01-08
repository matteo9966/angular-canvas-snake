import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-score-board',
  standalone: true,
  imports: [],
  templateUrl: './score-board.component.html',
  styleUrl: './score-board.component.scss',
})
export class ScoreBoardComponent {
  @Input() playersScores: { name: string; points: number }[] = [];
}
