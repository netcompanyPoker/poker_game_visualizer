import { Injectable } from '@angular/core';
import * as data from './Poker_History.json';

export const SETUP_TIMECONSTANT = 5;
export const NORMAL_TIMECONSTANT = 2;
export const PRE_STAGE_CHANGE_TIMECONSTANT = 0.5;
export const STAGE_CHANGE_TIMECONSTANT = 10;
export interface Players {
  name: string;
  id: number;
  stack: number;
}
export interface HandEvent {
  type: string;
  player: number;
  action?: any;
  card?: string;
  reward?: number;
  cards? : string[]
}

export interface GameJSON {
  hand_count: number;
  active_players: Players[];
  defeated_players: Players[];
  hand_events: HandEvent[];
}

export interface NewPlayer{
  name : string
  id : number
}

export type SeatState = 'active' | 'not-active' | 'out' | 'fold' | 'small-blind' | 'big-blind' | undefined;


export enum Action {
  Call = "Call",
  Raise = "Raise",
  Fold = "Fold",
  Check = "Check",
  SmallBlind = "Small blind",
  BigBlind = "Big blind",
  AllIn = "All in"
}
export interface State {
  id : number
  name : string
  stack : number
  cards: string[]
  seatstate : SeatState
  dealer : boolean
}

export interface StepOld{
  id  : number
  action? : string  
  cards? : string[]
  stage_contribution? : number
  stack? : number
  pot? : number
  stage? : Stage
}

export interface PlayerState{  
  name? : string
  action? : string
  cards?: string[]
  stage_contribution? : number
  stack? : number
  seatstate? : SeatState
  dealer? : boolean
  next_to_act? : boolean
  winner? : boolean
}

export interface BoardState{    
  cards? : string[]  
  pot? : number
  stage? : Stage
}

export interface Step{
  stepId  : number
  timeconstant : number  
  playerStates? : Map<number, PlayerState> 
  boardState? : BoardState
}

export interface BettingState{
  id  : number
  stage_contribution : number
  previous_contribution : number
  currentstack : number
  totalStack : number
}
export interface Hand{
  handId : Number
  totalTimeconstant : Number
  totalSteps : Number
  steps : Step[]
}

export interface Player {
  id : number;
  cards: string[];
  name: string;
  dealer : boolean;
  seatstate : SeatState;
}

export interface Game {
  hands : Hand[]
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
export class NewPokerGameService {
  game: GameJSON[];

  constructor() {
    this.game = data
  }

  getTransformedData(){
    const game: Game = {hands : []}
    //game.players = this.getGameplayers()
    game.hands = this.getHands()
    
    console.log('Game', game)
    return game
  }

  getHands(){
    const newHands : Hand[] = []
    for (let i = 0; i < this.game.length; i++) {
      const theHand : Hand = {handId : 0, totalTimeconstant: 0, totalSteps: 0, steps : []}
      const initialState :State[] = []           
      const hand = this.game[i];
      const handEvents = this.rewriteHandeventToId(hand.hand_events, hand.active_players);
      const activePlayers = hand.active_players;
      const defeated_players = hand.defeated_players
      const setupstep : Step = {stepId : 0, timeconstant: SETUP_TIMECONSTANT, playerStates : new Map<number, PlayerState>()}
      
      
      activePlayers.forEach((obj, index) => {
        const dealer = index == hand.active_players.length-1
        const playerState : PlayerState = {
          name : obj.name,
          dealer : dealer,
          stack : obj.stack,
          cards : this.getcards(obj.id, handEvents), 
          stage_contribution :  0,
          seatstate : 'active'
        }
        setupstep.playerStates!.set(obj.id, playerState)
        const state: State = {
          id : obj.id,
          name : obj.name,
          stack : obj.stack, 
          seatstate : 'active',
          cards : this.getcards(index, hand.hand_events), 
          dealer: dealer}
        initialState.push(state)
      })
      defeated_players.forEach((obj) => {
        const playerState : PlayerState = {
          name : obj.name,
          dealer : false,
          stack : obj.stack,
          cards : [],
          stage_contribution :  0,
          seatstate : 'out'
        }
        setupstep.playerStates!.set(obj.id, playerState)

        const state: State = {
          id : obj.id,
          name : obj.name,
          stack : obj.stack, 
          seatstate : 'out', 
          cards : [], 
          dealer: false}
        initialState.push(state)
      })

      theHand.steps.push(setupstep)
      // console.log('TheHand', theHand)
      
      // let filteredHandevents = handEvents.filter(x => !(x.player != -1 && x.type == 'deal' || x.type == 'reward'));   
    
      // const steps : StepOld[] = []
      // let currentStage = Stage.Preflop;
      // let currentRaise = 0
      // let betcontrol = new Map<number, BettingState>()
      // let pot = 0
      // hand.active_players.forEach(obj => {        
      //   betcontrol.set(obj.id,this.getBettingState(obj))
      // }
      //   )
      // let boardStepsLeft = 0
      // const handeventsZip = this.getZipped(filteredHandevents)
      // handeventsZip.forEach((obj, index) => {
      //   let mainobj = obj[0]!;
      //   const id = mainobj.player
      //   let step : StepOld | null = null
      //   if(mainobj.player != -1){
      //     const actionNumber = mainobj.action
      //     let bettingState = betcontrol.get(id)!

      //     currentRaise = actionNumber > 1 ? actionNumber : currentRaise
          
      //     bettingState = this.getUpdatedBettingState(actionNumber, bettingState, currentRaise)
          
      //     step = {
      //       id  : mainobj.player,
      //       action : this.setAction(mainobj.action, index, bettingState.currentstack == 0),
      //       stage : currentStage,
      //       stage_contribution : bettingState.stage_contribution,
      //       stack : bettingState.currentstack                      
      //     }
      //   }else{
      //     if(boardStepsLeft > 0){
      //       boardStepsLeft -= 1
      //     }else{
      //       const cards = this.getCardsforBoard(obj)
      //       boardStepsLeft = cards.length -1
      //       currentStage = this.setStage(cards.length, currentStage)   
      //       pot += this.calculatePot(betcontrol) 
      //       step = {
      //         id  : -1,
      //         cards : cards,
      //         stage : currentStage,
      //         pot : pot           
      //       }
      //       betcontrol.forEach(obj => obj = this.resetStageBettingstate(obj))

      //     }          
      //   }
      //   if(step != null ){
      //     steps.push(step)
      //   }        
      // })
             

     
      
      newHands.push(theHand)      
    }    
    return newHands
  }
  

  // calculatePot(bettingStates : Map<number, BettingState>): number{
  //   let pot = 0;
  //   bettingStates.forEach( obj => pot += obj.stage_contribution)
  //   return pot
  // }

  // getBettingState(activePlayer :Players):BettingState {
  //   return  {
  //     totalStack : activePlayer.stack,
  //     currentstack : activePlayer.stack,
  //     id : activePlayer.id,
  //     stage_contribution : 0,
  //     previous_contribution : 0
  //   }
  // }

  // resetStageBettingstate(current :BettingState):BettingState {
  //   const newbettingstate : BettingState = current;
  //   newbettingstate.previous_contribution = current.previous_contribution + current.stage_contribution
  //   newbettingstate.stage_contribution = 0
    
  //   return newbettingstate    
  // }

  // getUpdatedBettingState(actionNumber: number, currentState: BettingState, currentRaise: number ):BettingState {
  //   if(actionNumber == 0){
  //     return currentState;
  //   }
  //   const updatedBettingState : BettingState =  currentState

  //   let total_contribution = actionNumber > 1 ? actionNumber : currentRaise //call or raise
  //   total_contribution = total_contribution <= currentState.totalStack ? total_contribution : currentState.totalStack //all in? 
  //   let stage_contribution = total_contribution - currentState.previous_contribution //adjust bet to current stage

  //   updatedBettingState.stage_contribution = stage_contribution
  //   updatedBettingState.currentstack = currentState.totalStack - currentState.previous_contribution - stage_contribution 

  //   return updatedBettingState;
  // }


  // setStage( numberOfCards : number, currentStage : Stage): Stage{
  //   let newStage = Stage.Preflop
  //   if(currentStage == Stage.Preflop){
  //     if(numberOfCards == 3){
  //       newStage = Stage.Flop
  //     }else if ( numberOfCards == 5){
  //       newStage = Stage.Showdown
  //     }      
  //   }else if(currentStage == Stage.Flop){
  //     if(numberOfCards == 1){
  //       newStage = Stage.Turn
  //     }else if (numberOfCards == 2){
  //       newStage = Stage.Showdown
  //     }
  //   }else if(currentStage == Stage.Turn){
  //     newStage = Stage.River 
  //   }    
  //   return newStage
  // }



  // getCardsforBoard(events : (HandEvent|null)[]){
  //   let cards : string[] = []
  //   for (let i = 0; i < events.length; i++) {
  //     if(events[i] == null ||events[i]?.player != -1){
  //       break;
  //     }
  //     cards.push(events[i]?.action!)
  //   }
  //   return cards
  // }

  // getZipped(filteredHandevents : HandEvent[]){
  //   const Eventslength = filteredHandevents.length
  //   return filteredHandevents.map(function(e, i) {
  //     return [e, Eventslength-(i+1) >= 0 ?  filteredHandevents[i+1] : null ,
  //     Eventslength-(i+2) >= 0 ?  filteredHandevents[i+2] : null,
  //     Eventslength-(i+3) >= 0 ?  filteredHandevents[i+3] : null,
  //     Eventslength-(i+4) >= 0 ?  filteredHandevents[i+4] : null];
  //   });
  // }

  // getEventfromList(length : number, iterator : number, events : HandEvent[]): HandEvent | null{
  //   return length-(iterator) >= 0 ?  events[iterator] : null
  // }


  getcards(id: number, hand: HandEvent[]): string[]{
    const playercards = hand.filter(x=> x.type == 'deal' && x.player == id)
    const cards: string[] = [playercards[0].card!, playercards[1].card!]
    return cards
  }

  // setAction(actionId: number, index : number, isAllin : boolean): Action{
  //   let action = Action.Check
  //   if( index == 0){
  //     action = Action.SmallBlind
  //   }else if (index == 1){
  //     action = Action.BigBlind
  //   }else if(actionId == 0){
  //     action = Action.Fold
  //   }else if(actionId == 1){
  //     action =  Action.Call
  //   }else if ( actionId > 1){
  //     action =  Action.Raise
  //   }
  //   if(isAllin){
  //     action = Action.AllIn
  //   }
  //   return action
  // }

  rewriteHandeventToId(handevents : HandEvent[], players : Players[]): HandEvent[]{
    const newHandevents : HandEvent[] = []
    handevents.forEach(obj => {
      if(obj.player != -1){
        newHandevents.push({
          type : obj.type,
          player : players[obj.player].id,
          action : obj.action,
          card : obj.card,
          reward : obj.reward
        })
      }else{
        newHandevents.push({
          type : obj.type,
          player : obj.player,
          action : obj.action,
          card : obj.card,
          reward : obj.reward
        })
      }
      }
       )
    return newHandevents
  }
}
