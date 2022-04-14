import { Injectable } from '@angular/core';
import { Game, HandJSON } from './new-poker-game.service';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {

  constructor() { }



  getHighlightedHands(gameRaw : HandJSON[], gameTransformed : Game) : Game{
    const highlightedGame : Game = {hands : []}

    //add highlight logic


    highlightedGame.hands = gameTransformed.hands.slice(0,10)

    return highlightedGame    
  }
}
