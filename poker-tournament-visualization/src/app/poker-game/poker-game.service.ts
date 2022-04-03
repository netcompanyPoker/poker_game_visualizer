import { Injectable } from '@angular/core';
import * as data from './games.json';


export interface Player {
  id : number;
  cards: string[];
  name: string;
  dealer : boolean;
  seatstate : SeatState;
}

export type SeatState = 'active' | 'not-active' | 'out' | 'fold' | 'small-blind' | 'big-blind' | undefined;


export interface PokerGame {
  game_nbr: string;
  tournament_stage: string;
  player1: TopLevelPlayer1;
  player2: TopLevelPlayer1;
  hands: HandOld[];
  winner?: string;
}

export interface HandOld {
  nbr: number;
  raise_count: number;
  abs_reward: number;
  player1: HandPlayer1;
  player2: HandPlayer1;
  history: History[];
  player1_total_reward_before?: number;
  player2_total_reward_before?: number;
  winner?: string;
}

export interface History {
  player?: string;
  action: string;
  stage_contribution?: number;
  stack?: number;
  pot?: number;
  board_cards?: string[];
  player1_hand_type?: string;
  player2_hand_type?: string;
}

export interface HandPlayer1 {
  total_reward_before: number;
  winner: boolean;
  cards: string[];
}

export interface TopLevelPlayer1 {
  name: string;
  total_reward: number;
  winner?: boolean;
}

export interface PlayerStateOld {
  chips_wagered: number;
  stack: number;
  next_to_act: boolean;
  action: string;
  score: number;
}

export enum Stage {
  Preflop = "PREFLOP",
  Flop = "FLOP",
  Turn = "TURN",
  River = "RIVER",
  Showdown = "SHOWDOWN",
  EndHidden = "END_HIDDEN"
}

@Injectable({
  providedIn: 'root'
})
export class PokerGameService {
  game: PokerGame[];

  constructor() {
    this.game = data
  }
}
