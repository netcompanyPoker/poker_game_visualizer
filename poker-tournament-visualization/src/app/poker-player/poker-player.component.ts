import { Component, Input, OnInit } from '@angular/core';
import { Player, PlayerState } from '../poker-game/poker-game.service';

@Component({
  selector: 'app-poker-player',
  templateUrl: './poker-player.component.html',
  styleUrls: ['./poker-player.component.css']
})
export class PokerPlayerComponent implements OnInit {
  @Input() player!: Player;
  @Input() imgurl: string = 'https://cdn.pixabay.com/photo/2016/03/08/07/08/question-1243504_960_720.png';
  @Input() side = "left";
  @Input() playerState!: PlayerState;

  constructor() { }

  ngOnInit(): void { }
}
