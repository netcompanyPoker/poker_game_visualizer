import { Injectable } from '@angular/core';
import { Action, GameJSON, Hand, PlayerState, Step, SETUP_TIMECONSTANT, NORMAL_TIMECONSTANT, PRE_STAGE_CHANGE_TIMECONSTANT, BoardState, Stage, STAGE_CHANGE_TIMECONSTANT } from './new-poker-game.service';
import * as data from './Poker_History.json';

@Injectable({
  providedIn: 'root'
})
export class TestPokerGameService {
  game: GameJSON[];

  constructor() {
    this.game = data
  }

  getTestData(){    
    const hand : Hand = {handId : 0, totalSteps: 0, totalTimeconstant : 0 , steps : []}
    hand.steps.push(this.getTestdataSetupStep())
    hand.steps.push(this.getTestdataStepSmallBlind())
    hand.steps.push(this.getTestdataStepBigBlind())
    hand.steps.push(this.getTestdataStep3())
    hand.steps.push(this.getTestdataStep4())
    hand.steps.push(this.getTestdataPreFlop())
    hand.steps.push(this.getTestdataFlop())
    hand.steps.push(this.getTestdata7())
    hand.steps.push(this.getTestdata8())
    hand.steps.push(this.getTestdata9())
    hand.steps.push(this.getTestdata10())
    hand.steps.push(this.getTestdataPreTurn())
    hand.steps.push(this.getTestdataTurn())
    hand.steps.push(this.getTestdataStep13())
    hand.steps.push(this.getTestdataStep14())
    hand.steps.push(this.getTestdataPreRiver())
    hand.steps.push(this.getTestdataRiver())
    hand.steps.push(this.getTestdataStep17())
    hand.steps.push(this.getTestdataStep18())
    hand.steps.push(this.getTestdataPreShowdown())
    hand.steps.push(this.getTestdataShowdown())
    return {hands : [hand]}
  }

  getTestdataSetupStep():Step{
    const states = new Map<number, PlayerState>()    
    states.set(0, { name: "JHP", cards: ["Ac", "Ah"], stage_contribution: 0, stack: 1000, seatstate: 'active', dealer: true, next_to_act: false })
    states.set(1, { name: "TBK", cards: ["2c", "3h"], stage_contribution: 0, stack: 1000, seatstate: 'small-blind', dealer: false, next_to_act: true })
    states.set(2, { name: "FBL", cards: ["Tc", "Kh"], stage_contribution: 0, stack: 1000, seatstate: 'big-blind', dealer: false, next_to_act: false })
    return  {stepId : 0, timeconstant : SETUP_TIMECONSTANT, playerStates : states}
  }

  getTestdataStepSmallBlind():Step{
    const states = new Map<number, PlayerState>()  
    states.set(1, { action: Action.SmallBlind, stage_contribution: 5, stack: 995, next_to_act: false }) 
    states.set(2, { next_to_act: true })
    return  {stepId : 1, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataStepBigBlind():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {})
    states.set(2, { action: Action.BigBlind,stage_contribution: 10, stack: 990, next_to_act: false }) 
    states.set(0, {  next_to_act: true }) 
    return  {stepId : 2, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataStep3():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {next_to_act: true })
    states.set(2, {}) 
    states.set(0, { action: Action.Call,stage_contribution: 10, stack: 990, next_to_act: false }) 
    return  {stepId : 3, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataStep4():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {action: Action.Call,stage_contribution: 10, stack: 990, next_to_act: false })
    states.set(2, {next_to_act: true}) 
    states.set(0, {  }) 
    return  {stepId : 4, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataPreFlop():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {stage_contribution: 0, stack: 990,})
    states.set(2, {stage_contribution: 0, stack: 990, next_to_act: false}) 
    states.set(0, {stage_contribution: 0, stack: 990  })
    const boardState : BoardState = {pot : 30} 
    return  {stepId : 5, timeconstant : PRE_STAGE_CHANGE_TIMECONSTANT, playerStates : states, boardState : boardState}
  }

  getTestdataFlop():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {next_to_act : true})
    states.set(2, {}) 
    states.set(0, {})
    const boardState : BoardState = { cards : ["As", "Ad", "Kc"], stage : Stage.Flop} 
    return  {stepId : 6, timeconstant : STAGE_CHANGE_TIMECONSTANT, playerStates : states, boardState : boardState}
  }

  getTestdata7():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {action : Action.Raise, stage_contribution: 190, stack: 800, next_to_act: false})
    states.set(2, {next_to_act : true}) 
    states.set(0, {})    
    return  {stepId : 7, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdata8():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {})
    states.set(2, {action : Action.Raise, stage_contribution: 380, stack: 620, next_to_act: false}) 
    states.set(0, {next_to_act : true})    
    return  {stepId : 8, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdata9():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {next_to_act : true})
    states.set(2, {}) 
    states.set(0, {action : Action.Fold, stage_contribution: 0, stack: 990, next_to_act: false})    
    return  {stepId : 9, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdata10():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {action : Action.Call, stage_contribution: 380, stack: 620, next_to_act: false})
    states.set(2, {next_to_act : true}) 
    states.set(0, {seatstate: 'fold'})    
    return  {stepId : 10, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataPreTurn():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {stage_contribution: 0, stack: 620,})
    states.set(2, {stage_contribution: 0, stack: 620, next_to_act: false}) 
    states.set(0, {stage_contribution: 0, stack: 990  })
    const boardState : BoardState = {pot : 790} 
    return  {stepId : 11, timeconstant : PRE_STAGE_CHANGE_TIMECONSTANT, playerStates : states, boardState : boardState}
  }

  getTestdataTurn():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {next_to_act : true})
    states.set(2, {}) 
    const boardState : BoardState = { cards : ["As", "Ad", "Kc", "Qs"], stage : Stage.Turn} 
    return  {stepId : 12, timeconstant : STAGE_CHANGE_TIMECONSTANT, playerStates : states, boardState : boardState}
  }

  getTestdataStep13():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {action : Action.Check, stage_contribution: 0, stack: 620, next_to_act: false})
    states.set(2, {next_to_act : true}) 
    return  {stepId : 13, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataStep14():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {next_to_act : true})
    states.set(2, {action : Action.Check, stage_contribution: 0, stack: 620, next_to_act: false}) 
    return  {stepId : 14, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataPreRiver():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {stage_contribution: 0, stack: 620})
    states.set(2, {stage_contribution: 0, stack: 620})     
    const boardState : BoardState = {pot : 790}
    return  {stepId : 15, timeconstant : PRE_STAGE_CHANGE_TIMECONSTANT, playerStates : states, boardState : boardState}
  }

  getTestdataRiver():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {next_to_act : true})
    states.set(2, {}) 
    const boardState : BoardState = { cards : ["As", "Ad", "Kc", "Qs", "Js"], stage : Stage.River} 
    return  {stepId : 16, timeconstant : STAGE_CHANGE_TIMECONSTANT, playerStates : states, boardState : boardState}
  }

  getTestdataStep17():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {action : Action.AllIn, stage_contribution: 620, stack: 0, next_to_act : false})
    states.set(2, { next_to_act: true}) 
    return  {stepId : 17, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataStep18():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, { next_to_act : true})
    states.set(2, { action : Action.AllIn, stage_contribution: 620, stack: 0, next_to_act : false}) 
    return  {stepId : 18, timeconstant : NORMAL_TIMECONSTANT, playerStates : states}
  }

  getTestdataPreShowdown():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {stage_contribution: 0, stack: 0, next_to_act : false})
    states.set(2, {stage_contribution: 0, stack: 0})     
    const boardState : BoardState = {pot : 2030}
    return  {stepId : 15, timeconstant : PRE_STAGE_CHANGE_TIMECONSTANT, playerStates : states, boardState : boardState}
  }

  getTestdataShowdown():Step{
    const states = new Map<number, PlayerState>() 
    states.set(1, {winner : true, stage_contribution : 2030})
    states.set(2, {}) 
    const boardState : BoardState = { pot: 0, stage : Stage.Showdown} 
    return  {stepId : 16, timeconstant : STAGE_CHANGE_TIMECONSTANT, playerStates : states, boardState : boardState}
  }
}
