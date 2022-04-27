/* eslint-disable require-jsdoc */
import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { Game, PlayerState, Player, Step, BoardState } from '../poker-game/new-poker-game.service';
import { History, PlayerStateOld, Stage } from '../poker-game/poker-game.service';
import * as confetti from 'canvas-confetti';
import { coerceStringArray } from '@angular/cdk/coercion';

@Component({
  selector: 'app-poker-table',
  templateUrl: './poker-table.component.html',
  styleUrls: ['./poker-table.component.css']
})
export class PokerTableComponent implements OnInit, OnChanges {
  @Input() game!: Game;
  @Input() stage!: Stage;
  @Input() hand!: number;
  @Input() step!: number;

  history: History[] = [];
  community: string[] = [];
  board: BoardState = {}

  playingConfetti = false

  pot = 0
  myCanvas: HTMLCanvasElement | undefined;
  myConfetti: confetti.CreateTypes | undefined;
  constructor() {
  }

  ngOnInit(): void {
    this.myCanvas = document.createElement('canvas');
    document.body.appendChild(this.myCanvas);
    this.myCanvas.style.height = "100%"
    this.myCanvas.style.width = "100%"
    this.myCanvas.style.pointerEvents = "none"
    this.myCanvas.style.position = "fixed"
    this.myCanvas.style.top = "0"
    this.myCanvas.style.left = "0"
    this.myCanvas.style.zIndex = "9999"

    this.myConfetti = confetti.create(this.myCanvas, {
      resize: true,
      useWorker: true
    });
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }): void {
    this.board = this.setBoardState()
  }

  getPlayer(id: number): PlayerState {
    const steps = this.game.hands[this.hand].steps.slice(0, this.step + 1).filter(x => x.playerStates != null && x.playerStates.has(id))
    if (steps.length == 0) {
      return {
        seatstate: 'not-active'
      };
    }
    let playerstates: PlayerState[] = steps.map(x => x.playerStates!.get(id)!)
    return this.buildPlayerState(playerstates)
  }


  buildPlayerState(playerStates: PlayerState[]): PlayerState {
    let currentPlayerState: PlayerState = {};
    playerStates.forEach(obj => currentPlayerState = this.updatePlayerState(currentPlayerState, obj))
    return currentPlayerState
  }



  updatePlayerState(currentPlayerState: PlayerState, newPlayerState: PlayerState): PlayerState {
    let playerState: PlayerState = currentPlayerState
    if (newPlayerState.name != null) {
      playerState.name = newPlayerState.name
    }
    playerState.action = newPlayerState.action
    if (newPlayerState.cards != null) {
      playerState.cards = newPlayerState.cards
    }
    if (newPlayerState.stage_contribution != null) {
      playerState.stage_contribution = newPlayerState.stage_contribution
    }
    if (newPlayerState.stack != null) {
      playerState.stack = newPlayerState.stack
    }
    if (newPlayerState.seatstate != null) {
      playerState.seatstate = newPlayerState.seatstate
    }
    if (newPlayerState.dealer != null) {
      playerState.dealer = newPlayerState.dealer
    }
    if (newPlayerState.next_to_act != null) {
      playerState.next_to_act = newPlayerState.next_to_act
    }
    if (newPlayerState.winner != null) {
      playerState.winner = newPlayerState.winner
      if (playerState.winner) {
        if (this.playingConfetti == false) {
          console.log(`winner: ${playerState.name}: playing? ${this.playingConfetti}`)
          console.log(this)
          this.playingConfetti = true;
          this.wonGame()
          setTimeout(() => {
            this.playingConfetti = false;
            this.myConfetti!.reset();
          }, 5000)
        }
      }
    }
    if (newPlayerState.out_position != null) {
      playerState.out_position = newPlayerState.out_position
    }
    if (newPlayerState.win_chance != null) {
      playerState.win_chance = newPlayerState.win_chance
    }

    return playerState
  }

  wonGame() {
    console.log("won game")
    this.myConfetti!({
      particleCount: 100,
      spread: 160
      // any other options from the global
      // confetti function
    });
  }

  setBoardState(): BoardState {
    const steps = this.game.hands[this.hand].steps.slice(0, this.step + 1).filter(x => x.boardState != null)
    if (steps.length == 0) {
      return {
        pot: 0,
        cards: [],
        stage: Stage.Preflop
      };
    }
    let boardstates: BoardState[] = steps.map(x => x.boardState!)
    return this.buildBoardState(boardstates)
  }

  buildBoardState(boardstates: BoardState[]): BoardState {
    let currentBoardState: BoardState = { pot: 0, cards: [], stage: Stage.Preflop };
    boardstates.forEach(obj => currentBoardState = this.updateBoardState(currentBoardState, obj))
    return currentBoardState
  }

  updateBoardState(currentBoardState: BoardState, newBoardState: BoardState): BoardState {
    let boardState: BoardState = currentBoardState
    if (newBoardState.pot != null) {
      boardState.pot = newBoardState.pot
    }
    if (newBoardState.stage) {
      boardState.stage = newBoardState.stage
    }
    if (newBoardState.cards != null) {
      boardState.cards = newBoardState.cards
    }
    if (newBoardState.bigBlind != null) {
      boardState.bigBlind = newBoardState.bigBlind
    }
    if (newBoardState.smallBlind != null) {
      boardState.smallBlind = newBoardState.smallBlind
    }
    return boardState
  }

}

