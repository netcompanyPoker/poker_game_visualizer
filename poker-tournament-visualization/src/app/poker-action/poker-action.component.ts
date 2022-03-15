import { Component, Input, OnInit } from '@angular/core';
import { PokerGame, PokerGameService, Stage, TopLevelPlayer1, History } from '../poker-game/poker-game.service';

@Component({
  selector: 'app-poker-action',
  templateUrl: './poker-action.component.html',
  styleUrls: ['./poker-action.component.css']
})
export class PokerActionComponent implements OnInit {
  @Input() action: History | undefined;

  constructor() { }

  ngOnInit(): void {
  }
}
