import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { PlayerState } from '../poker-game/new-poker-game.service';
import { Player, PlayerStateOld, SeatState } from '../poker-game/poker-game.service';


interface VisualSettings {
  color: string;
  offsetX: number;
  offsetY: number;
}
@Component({
  selector: 'app-poker-player',
  templateUrl: './poker-player.component.html',
  styleUrls: ['./poker-player.component.css']
})
export class PokerPlayerComponent implements OnInit {
  @Input() player!: PlayerState
  @Input() imgurl: string = 'https://cdn.pixabay.com/photo/2016/03/08/07/08/question-1243504_960_720.png'; 
  @Input() playerNo: number = 0; 


  visualSettings: VisualSettings[] = [
    {
      color: '#1abc9c', //0 
      offsetX: 232,
      offsetY: -184,
    },
    {
      color: '#2ecc71', //1      
      offsetX: 232,
      offsetY: 40,
    },
    {
      color: '#3498db', //2      
      offsetX: 112,
      offsetY: 66,
    },
    {
      color: '#9b59b6', //3
      offsetX: 112,
      offsetY: 66,
    },
    {
      color: '#34495e', //4
      offsetX: 112,
      offsetY: 66,
    },
    {
      color: '#f1c40f', //5        
      offsetX: -6,
      offsetY: 40,
    },
    {
      color: '#e67e22', //6     
      offsetX: -6,
      offsetY: -180,
    },
    {
      color: '#e74c3c', //7     
      offsetX: 112,
      offsetY: -212,
    },
    {
      color: '#63cdda', //8
      
      offsetX: 112,
      offsetY: -212,
    },
    {
      color: '#cf6a87', //9      
      offsetX: 112,
      offsetY: -212,
    }
  ];


  constructor() { }

  ngOnInit(): void {
    if (this.playerNo > 0) {
      this.playerNo--;
    }

    if (this.player.seatstate === 'not-active') {
      this.player = {        
        name: '',
        cards: [],
        dealer: false,
        seatstate: 'not-active' 
      };
    }
  } 

}
