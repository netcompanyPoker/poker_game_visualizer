/* eslint-disable require-jsdoc */
import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { Hand, HandPlayer1, History, Player, PlayerState, PokerGame, Stage, TopLevelPlayer1 } from '../poker-game/poker-game.service';

@Component({
  selector: 'app-poker-table',
  templateUrl: './poker-table.component.html',
  styleUrls: ['./poker-table.component.css']
})
export class PokerTableComponent implements OnInit, OnChanges {
  @Input() game!: PokerGame;
  @Input() stage!: Stage;
  @Input() hand!: number;
  @Input() step!: number;

  history: History[] = [];
  community: string[] = [];

  player1!: Player;
  player2!: Player;
  player1Playerstate: PlayerState = {chips_wagered: 0, stack: 1000, next_to_act: false, action: '', score: 0};
  player2Playerstate: PlayerState= {chips_wagered: 0, stack: 1000, next_to_act: false, action: '', score: 0};
  player1link="https://media-exp1.licdn.com/dms/image/C5603AQGAUW9uU9JtGw/profile-displayphoto-shrink_200_200/0/1581669563810?e=1640217600&v=beta&t=WHteJ76sNXQZ9l6yySjTvMNTyExfgZtYPa5WRIctkyk"
  player2link="https://media-exp1.licdn.com/dms/image/C5603AQHxqi2EjCLiKQ/profile-displayphoto-shrink_200_200/0/1580829910259?e=1640217600&v=beta&t=6Ry0x-EzdCjOmgaIcXGoO4jrZv7Uh2ROx2ymfOr3ag4"
  pot = 0

  constructor() {
  }

  ngOnInit(): void {
    this.setupGame()
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }): void {
    this.setupGame()
    console.log("table changes!")
    let change: SimpleChange = changes['data'];
    console.log(change)
    console.log(changes)
    this.setCommunity();
    this.player1Playerstate = this.setPlayerState('player1');
    this.player2Playerstate = this.setPlayerState('player2');
    console.log('playerstate', this)
  }
  setupGame(){
    this.player1 = this.getPlayer(this.game.hands[this.hand].player1, this.game.player1);
    this.player2 = this.getPlayer(this.game.hands[this.hand].player2, this.game.player2);
    this.history = this.game.hands[this.hand].history;
  }

  getGameScore(player: string){
    if(player == 'player1'){
      return this.game.hands[this.hand].player1.total_reward_before
    }
    return this.game.hands[this.hand].player2.total_reward_before
    
  }


  getPlayer(handPlayer: HandPlayer1, player: TopLevelPlayer1): Player {
    return {
      name: player.name,
      winner: player.winner,
      cards: handPlayer.cards,
      total_reward: player.total_reward
    }
  }

  setPlayerState(player: string): PlayerState{
    let playerstate: PlayerState = {stack: 0, chips_wagered: 0, next_to_act: false, action: '', score: this.getGameScore(player)};
    if((this.stage == Stage.Showdown || this.stage == Stage.EndHidden) && this.isPlayerWinner(player, this.game.hands[this.hand])){
      playerstate.chips_wagered = this.game.hands[this.hand].abs_reward * 2
    }else{
      for (let index = 0; index <= this.step; index++) {
        const history = this.history[index];
        if(history.player == player){
          playerstate.chips_wagered = history.stage_contribution!
          playerstate.stack = history.stack!
        }
        if(history.pot != null){
          playerstate.chips_wagered = 0
        }        
      } 
    }
     
    if (this.history.length - 1  > this.step + 1 && this.history[this.step+1].player == player){
      playerstate.next_to_act = true
    }
    if( this.history[this.step].player == player){
      playerstate.action = this.getActionText(this.history[this.step].action)
    }else{
      playerstate.action = this.stage == Stage.Showdown ? this.getHandType(player,this.history[this.step]) : ''      
      
    }
    return playerstate;    
  }

  isPlayerWinner(player: string, hand: Hand){
    if(player == 'player1'){
      return hand.player1.winner
    }
    return hand.player2.winner
  }

  getHandType(player: string,history: History): string{
    if(player == 'player1'){
      return history.player1_hand_type!
    }
    return history.player2_hand_type!
  }

  setCommunity(): void {
    const community: string[] = []
    var pot = 0;


    if (this.stage == Stage.Flop) {
      const currenthistory = this.game.hands[this.hand].history[this.getStageIndex(Stage.Flop)]
      const cards = currenthistory!.board_cards;
      pot = currenthistory!.pot!
      if (cards != undefined) {
        community.push(...cards);
      }
    }

    if (this.stage == Stage.Turn) {
      const currenthistory = this.game.hands[this.hand].history[this.getStageIndex(Stage.Turn)]
      const cards = currenthistory!.board_cards;    
      pot = currenthistory!.pot!  
      if (cards != undefined) {
        community.push(...cards);
      }
    }
    if (this.stage == Stage.River) {
      const currenthistory = this.game.hands[this.hand].history[this.getStageIndex(Stage.River)]
      const cards = currenthistory!.board_cards;   
      pot = this.stage == Stage.River ? currenthistory!.pot! : 0
      if (cards != undefined) {
        community.push(...cards);
      }
    }

    if (this.stage == Stage.Showdown || this.stage == Stage.EndHidden){
      const currenthistory = this.game.hands[this.hand].history[this.getStageIndex(this.stage)]
      const cards = currenthistory!.board_cards;   
      pot = 0
      if (cards != undefined) {
        community.push(...cards);
      }
    }
    
    this.pot = pot
    this.community = community;
  }

  getStageIndex(stage: Stage) {
    return this.history.findIndex(x => x.action == stage.toString().toLocaleUpperCase())
  }


  getActionText(action: string){
    let actionText = "";
    switch(action) { 
      case "small_blind": { 
         actionText = "Small blind";
         break; 
      } 
      case "big_blind": { 
        actionText = "Big blind";
         break; 
      }
      case "RAISE": { 
        actionText = "Raise";
         break; 
      }
      case "CALL": { 
        actionText = "Call";
         break; 
      }
      case "FOLD": { 
        actionText = "Fold";
         break; 
      }
      case "CHECK": { 
        actionText = "Check";
         break; 
      }
      default: { 
        actionText = ""
         break; 
      }       
   } 
   return actionText;
  }
}

