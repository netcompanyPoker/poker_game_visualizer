import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as data from './output.json';
import { BehaviorSubject } from 'rxjs';

export const SETUP_TIMECONSTANT = 10;
export const NORMAL_TIMECONSTANT = 5;
export const PRE_STAGE_CHANGE_TIMECONSTANT = 6;
export const STAGE_CHANGE_TIMECONSTANT = 10;
export const SLOW_STAGE_CHANGE_TIMECONSTANT = 20;
export const WINNER_TIMECONSTANT = 6;
export interface Players {
  name: string;
  id: number;
  stack: number;
}
export interface HandEvent {
  type: string
  player: number
  action?: any
  card?: string
  reward?: number
  handtype?: string
  win_chance?: number
}

export interface HandJSON {
  hand_count: number;
  active_players: Players[];
  defeated_players: Players[];
  hand_events: HandEvent[];
  highlight_score?: number;
}

export interface NewPlayer {
  name: string
  id: number
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
  id: number
  name: string
  stack: number
  cards: string[]
  seatstate: SeatState
  dealer: boolean
}
export interface PlayerState {
  name?: string
  action?: string
  cards?: string[]
  stage_contribution?: number
  stack?: number
  seatstate?: SeatState
  dealer?: boolean
  next_to_act?: boolean
  winner?: boolean
  out_position?: number
  win_chance?: number
}

export interface BoardState {
  cards?: string[]
  pot?: number
  stage?: Stage
  bigBlind?: number
  smallBlind?: number
}

export interface Step {
  stepId: number
  timeconstant: number
  playerStates?: Map<number, PlayerState>
  boardState?: BoardState
}

export interface BettingState {
  id: number
  stage_contribution: number
  previous_contribution: number
  currentstack: number
  totalStack: number
}
export interface Hand {
  handId: number
  totalTimeconstant: number
  totalSteps: number
  steps: Step[]
}

export interface Player {
  id: number;
  cards: string[];
  name: string;
  dealer: boolean;
  seatstate: SeatState;
}

export interface Game {
  hands: Hand[]
}

export enum Stage {
  Preflop = "PREFLOP",
  Flop = "FLOP",
  Turn = "TURN",
  River = "RIVER",
  Showdown = "SHOWDOWN",
  EndHidden = "END_HIDDEN"
}

export const DATA_ENDPOINT = environment.dataEndpoint;



@Injectable({
  providedIn: 'root'
})
export class NewPokerGameService {
  game: HandJSON[];
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpClient) {
    this.game = data
    this.isLoading.next(false);
  }

  setNewGame(path: string) {
    // "testrunde1/run-20220424-214441-0.json"
    this.isLoading.next(true);

    this.http.get<HandJSON[]>(DATA_ENDPOINT + path)
      .subscribe(x => {
        this.game = x;
        console.log("got new data ... ")
        this.isLoading.next(false);
      })
  }

  getTransformedData() {
    const game: Game = { hands: [] }
    game.hands = this.getHands()
    console.log('hands', game.hands)
    return game
  }

  getHands() {
    const newHands: Hand[] = []
    for (let i = 0; i < this.game.length; i++) {

      const theHand: Hand = { handId: this.game[i].hand_count, totalTimeconstant: 0, totalSteps: 0, steps: [] }
      const hand = this.game[i];
      const handEvents = this.rewriteHandeventToId(hand.hand_events, hand.active_players);


      const setupstep: Step = this.getSetupStep(hand, handEvents);
      theHand.steps.push(setupstep)

      let filteredHandevents = handEvents.filter(x => !(x.player != -1 && x.type == 'deal' || x.type == 'reward'));



      let currentStage: Stage = Stage.Preflop;
      let currentRaise = 0
      let betcontrol = new Map<number, BettingState>()
      let pot = 0
      let community: string[] = []
      hand.active_players.forEach(obj => {
        betcontrol.set(obj.id, this.getBettingState(obj))
      }
      )
      let boardStepsLeft = 0

      filteredHandevents.forEach((obj, index) => {
        let mainobj = obj!;
        const id = mainobj.player


        if (mainobj.player != -1 && mainobj.type != 'win_chance') {
          let step: Step = { stepId: index + 1, timeconstant: NORMAL_TIMECONSTANT, playerStates: new Map<number, PlayerState>() }
          const actionNumber = mainobj.action
          let bettingState = betcontrol.get(id)!

          currentRaise = actionNumber > 1 ? actionNumber : currentRaise

          bettingState = this.getUpdatedBettingState(actionNumber, bettingState, currentRaise)
          //add reset of last actor
          if (index != 0) {
            if (filteredHandevents[index - 1].player != -1) {
              const playerfolded = filteredHandevents[index - 1]?.action == 0
              step.playerStates!.set(filteredHandevents[index - 1].player, { seatstate: playerfolded ? 'fold' : 'active' })
            }
          }
          //add Next_to_Add
          if (index != filteredHandevents.length - 1) {
            if (filteredHandevents[index + 1].player != -1) {
              step.playerStates!.set(filteredHandevents[index + 1].player, { next_to_act: true })
            }
          }


          step.playerStates!.set(mainobj.player, {
            action: this.setAction(mainobj.action, index, bettingState.currentstack == 0, bettingState.stage_contribution == 0),
            stage_contribution: bettingState.stage_contribution,
            stack: bettingState.currentstack,
            next_to_act: false
          })
          theHand.steps.push(step)
        } else if (mainobj.player == -1 && mainobj.type != 'win_chance') {
          if (boardStepsLeft > 0) {
            boardStepsLeft -= 1
          } else {
            //pre stage
            // logic hvis player har smidt mere i end andre, så får han noget tilbage igen?
            //eller også vinder han det ved rewards? tag start af det andet game? 
            let prestep: Step | undefined;
            let newpot
            const onlyOneLeft = hand.active_players.length - filteredHandevents.slice(0, index).filter(x => x.type == 'action' && x.action == 0).length == 1;
            ({ prestep, newpot } = this.preStage(pot, betcontrol, onlyOneLeft));
            const playerfolded = filteredHandevents[index - 1]?.action == 0
            prestep.playerStates?.set(filteredHandevents[index - 1].player, { stage_contribution: 0, seatstate: playerfolded ? 'fold' : 'active' })
            pot = newpot
            theHand.steps.push(prestep)

            //main stage          

            const cards = this.getCardsforBoard(filteredHandevents.slice(index).filter(x => x.type != 'win_chance').slice(0, 5))
            console.log(cards)
            boardStepsLeft = cards.length - 1

            if (this.isSlowFlow(cards, currentStage)) {
              if (currentStage == Stage.Preflop) {
                //Flop
                community = community.concat(cards.slice(0, 3))
                const flophandevents = filteredHandevents.slice(index + community.length, index + community.length + hand.active_players.length);
                currentStage = Stage.Flop
                const flopplayerstates = this.getStagePlayerstate(flophandevents, null)
                const flopStageStep = this.getStageStep(community, currentStage, flopplayerstates, true);
                theHand.steps.push(flopStageStep)
                //Turn
                community = community.concat(cards.slice(3, 4))
                const turnhandevents = filteredHandevents.slice(index + community.length + flopplayerstates.size, index + community.length + flopplayerstates.size + hand.active_players.length);
                currentStage = Stage.Turn
                const turnplayerstates = this.getStagePlayerstate(turnhandevents, null)
                const turnStageStep = this.getStageStep(community, currentStage, turnplayerstates, true)
                theHand.steps.push(turnStageStep)
                //River
                community = community.concat(cards.slice(4, 5))
                const riverhandevents = filteredHandevents.slice(index + community.length + flopplayerstates.size * 2, index + community.length + flopplayerstates.size * 2 + hand.active_players.length);
                currentStage = Stage.Showdown
                const riverplayerstates = this.getStagePlayerstate(riverhandevents, null)
                const riverStageStep = this.getStageStep(community, currentStage, riverplayerstates, true)
                theHand.steps.push(riverStageStep)
              } else if (currentStage == Stage.Flop) {
                community = community.concat(cards.slice(0, 1))
                const turnhandevents = filteredHandevents.slice(index + community.length, index + community.length + hand.active_players.length);
                currentStage = Stage.Turn
                const turnplayerstates = this.getStagePlayerstate(turnhandevents, null)
                const turnStageStep = this.getStageStep(community, currentStage, turnplayerstates, true)
                theHand.steps.push(turnStageStep)
                //River
                community = community.concat(cards.slice(1, 2))
                const riverhandevents = filteredHandevents.slice(index + community.length + turnplayerstates.size * 2, index + community.length + turnplayerstates.size * 2 + hand.active_players.length);
                currentStage = Stage.Showdown
                const riverplayerstates = this.getStagePlayerstate(riverhandevents, null)
                const riverStageStep = this.getStageStep(community, currentStage, riverplayerstates, true)
                theHand.steps.push(riverStageStep)
              }
            } else {
              community = community.concat(cards)
              const handevents = filteredHandevents.slice(index + cards.length, index + cards.length + hand.active_players.length);
              currentStage = this.setStage(cards.length, currentStage, this.isbetroundAfterRiver(filteredHandevents))
              const next_to_act_id = index != filteredHandevents.length - 1 - boardStepsLeft && filteredHandevents[index + 1 + boardStepsLeft].player != -1 ? filteredHandevents[index + 1 + boardStepsLeft].player : null
              const playerstates = this.getStagePlayerstate(handevents, next_to_act_id)
              const StageStep = this.getStageStep(community, currentStage, playerstates, false)
              theHand.steps.push(StageStep)
            }

            betcontrol.forEach(obj => obj = this.resetStageBettingstate(obj))
          }
        }
      })
      //preWinner where everyone fold
      const onlyOneLeft = hand.active_players.length - filteredHandevents.filter(x => x.type == 'action' && x.action == 0).length == 1;
      if (this.isbetroundAfterRiver(filteredHandevents)) {


        let prestep: Step | undefined;
        let newpot
        ({ prestep, newpot } = this.preStage(pot, betcontrol, onlyOneLeft));
        pot = newpot
        theHand.steps.push(prestep)
      }
      //add winner logic      
      const stages: Stage[] = theHand.steps.filter(x => x.boardState?.stage != null).map(x => x.boardState!.stage!)
      const isShowdown = stages[stages.length - 1] == Stage.Showdown || stages[stages.length - 1] == Stage.River && !onlyOneLeft


      let rewards = handEvents.filter(x => x.type == 'reward');
      let winnerPlayerstate = new Map<number, PlayerState>()
      rewards.forEach(obj => {
        winnerPlayerstate.set(obj.player,
          {
            stage_contribution: obj.reward! > 0 ? obj.reward! + (betcontrol.get(obj.player)!.totalStack - betcontrol.get(obj.player)!.currentstack) : 0,
            winner: obj.reward! > 0 ? true : false,
            action: isShowdown ? this.getHandtype(obj.handtype!) : undefined
          })
      })


      let winnerboardstate: BoardState = {
        pot: 0
      }
      let winnerstep: Step = { stepId: 99, timeconstant: WINNER_TIMECONSTANT, playerStates: winnerPlayerstate, boardState: winnerboardstate }
      theHand.steps.push(winnerstep)
      theHand.totalTimeconstant = this.calculateTotalTimeconstant(theHand.steps)
      theHand.totalSteps = theHand.steps.length
      newHands.push(theHand)
    }
    return newHands
  }

  getHandtype(handtype: string): string {
    if (handtype == "TWOPAIR") {
      return "Two Pairs"
    } else if (handtype == "HIGHCARD") {
      return "High Card"
    } else if (handtype == "THREEOFAKIND") {
      return "Three of a kind"
    } else if (handtype == "PAIR") {
      return "Pair"
    } else if (handtype == "STRAIGHT") {
      return "Straight"
    } else if (handtype == "FLUSH") {
      return "Flush"
    } else if (handtype == "FULLHOUSE") {
      return "Full House"
    } else if (handtype == "FOUROFAKIND") {
      return "Four of a kind"
    } else if (handtype == "STRAIGHTFLUSH") {
      return "Straight Flush!!"
    }

    return handtype
  }

  isbetroundAfterRiver(handevents: HandEvent[]): boolean {
    const filteredHandeventswithoutWinchance = handevents.filter(x => x.type != 'win_chance')
    return filteredHandeventswithoutWinchance[filteredHandeventswithoutWinchance.length - 1].player != -1
  }

  getStageStep(community: string[], stage: Stage, playerstates: Map<number, PlayerState>, slowstage: boolean) {

    const boardstate: BoardState = {
      cards: community,
      stage: stage
    }
    const StageStep: Step = { stepId: 1, timeconstant: slowstage ? SLOW_STAGE_CHANGE_TIMECONSTANT : STAGE_CHANGE_TIMECONSTANT, playerStates: playerstates, boardState: boardstate }
    return StageStep
  }

  getStagePlayerstate(handevents: HandEvent[], next_to_act_id: number | null): Map<number, PlayerState> {
    let playerstates: Map<number, PlayerState> = new Map<number, PlayerState>()
    console.log('Handevents', handevents)
    for (let i = 0; i < handevents.length; i++) {
      if (handevents[i].type != 'win_chance') {
        break;
      }
      if (next_to_act_id != null && next_to_act_id == handevents[i].player) {
        playerstates.set(handevents[i].player, { win_chance: Math.round(handevents[i].win_chance! * 100), next_to_act: true })
      } else {
        playerstates.set(handevents[i].player, { win_chance: Math.round(handevents[i].win_chance! * 100) })
      }

    }
    return playerstates
  }



  private preStage(pot: number, betcontrol: Map<number, BettingState>, onlyOneLeft: boolean) {
    const overkill = this.getoverkill(betcontrol);
    if (overkill != null && !onlyOneLeft) {
      var tempBettingState: BettingState | undefined = betcontrol.get(overkill.id)
      if (tempBettingState != null) {
        tempBettingState.stage_contribution = tempBettingState.stage_contribution - overkill.overkill
        tempBettingState.currentstack = tempBettingState.currentstack + overkill.overkill
        betcontrol.set(overkill.id, tempBettingState)
      }

    }
    const newpot = pot += this.calculatePot(betcontrol);
    let preboardstate: BoardState = {
      pot: newpot
    };

    let preplayerstates = new Map<number, PlayerState>();
    betcontrol.forEach(obj => preplayerstates.set(obj.id, { stage_contribution: 0, stack: obj.currentstack }));

    betcontrol.forEach(obj => obj = this.resetStageBettingstate(obj));
    let prestep: Step = { stepId: 0, timeconstant: PRE_STAGE_CHANGE_TIMECONSTANT, playerStates: preplayerstates, boardState: preboardstate };
    return { prestep, newpot };
  }

  private getSetupStep(hand: HandJSON, handEvents: HandEvent[]) {
    const activePlayers = hand.active_players;
    const defeated_players = hand.defeated_players;
    const actions = hand.hand_events.filter(x => x.type == 'action')
    const smallBlind = actions[0].action
    const bigBlind = actions[1].action
    const boardState: BoardState = { bigBlind: bigBlind, smallBlind: smallBlind }
    const setupstep: Step = { stepId: 0, timeconstant: SETUP_TIMECONSTANT, playerStates: new Map<number, PlayerState>(), boardState: boardState };
    const playerCount = activePlayers.length + defeated_players.length

    activePlayers.forEach((obj, index) => {
      const dealer = index == hand.active_players.length - 1;
      const playerState: PlayerState = {
        name: obj.name,
        dealer: dealer,
        stack: obj.stack,
        cards: this.getcards(obj.id, handEvents),
        stage_contribution: 0,
        seatstate: 'active',
        next_to_act: index == 0 ? true : false
      };
      setupstep.playerStates!.set(obj.id, playerState);
    });
    defeated_players.forEach((obj, idx) => {
      const playerState: PlayerState = {
        name: obj.name,
        dealer: false,
        stack: obj.stack,
        cards: [],
        stage_contribution: 0,
        seatstate: 'out',
        next_to_act: false,
        out_position: playerCount - idx
      };
      setupstep.playerStates!.set(obj.id, playerState);
    });
    return setupstep;
  }

  getoverkill(bettingStates: Map<number, BettingState>) {

    const BettingStageList: BettingState[] = []
    bettingStates.forEach(obj => {
      BettingStageList.push(obj)
    })
    const sortedBettingStates: BettingState[] = BettingStageList.sort((a, b) => b.stage_contribution - a.stage_contribution)
    if (sortedBettingStates.filter(x => x.stage_contribution == sortedBettingStates[0].stage_contribution).length == 1) {
      const overkill = sortedBettingStates[0].stage_contribution - sortedBettingStates[1].stage_contribution
      const overkillBettingstate = { id: sortedBettingStates[0].id, overkill: overkill }
      return overkillBettingstate
    }

    return null;
  }

  isSlowFlow(cards: string[], stage: Stage): boolean {
    if (stage == Stage.Preflop) {
      return cards.length == 5
    } else if (stage == Stage.Flop) {
      return cards.length == 2
    }
    return false
  }

  calculatePot(bettingStates: Map<number, BettingState>): number {
    let pot = 0;
    bettingStates.forEach(obj => pot += obj.stage_contribution)
    return pot
  }

  calculateTotalTimeconstant(steps: Step[]): number {
    let totaltimeconstant = 0;
    steps.forEach(obj => totaltimeconstant += obj.timeconstant)
    return totaltimeconstant
  }

  getBettingState(activePlayer: Players): BettingState {
    return {
      totalStack: activePlayer.stack,
      currentstack: activePlayer.stack,
      id: activePlayer.id,
      stage_contribution: 0,
      previous_contribution: 0
    }
  }

  resetStageBettingstate(current: BettingState): BettingState {
    const newbettingstate: BettingState = current;
    newbettingstate.previous_contribution = current.previous_contribution + current.stage_contribution
    newbettingstate.stage_contribution = 0

    return newbettingstate
  }

  getUpdatedBettingState(actionNumber: number, currentState: BettingState, currentRaise: number): BettingState {
    if (actionNumber == 0) {
      return currentState;
    }
    const updatedBettingState: BettingState = currentState

    let total_contribution = actionNumber > 1 ? actionNumber : currentRaise //call or raise
    total_contribution = total_contribution <= currentState.totalStack ? total_contribution : currentState.totalStack //all in? 
    let stage_contribution = total_contribution - currentState.previous_contribution //adjust bet to current stage

    updatedBettingState.stage_contribution = stage_contribution
    updatedBettingState.currentstack = currentState.totalStack - currentState.previous_contribution - stage_contribution

    return updatedBettingState;
  }


  setStage(numberOfCards: number, currentStage: Stage, islaststep: boolean): Stage {
    let newStage = Stage.Preflop
    if (currentStage == Stage.Preflop) {
      if (numberOfCards == 3) {
        newStage = Stage.Flop
      } else if (numberOfCards == 5) {
        newStage = Stage.Showdown
      }
    } else if (currentStage == Stage.Flop) {
      if (numberOfCards == 1) {
        newStage = Stage.Turn
      } else if (numberOfCards == 2) {
        newStage = Stage.Showdown
      }
    } else if (currentStage == Stage.Turn) {
      if (islaststep) {
        newStage = Stage.Showdown
      } else {
        newStage = Stage.River
      }
    }
    return newStage
  }



  getCardsforBoard(events: (HandEvent | null)[]) {
    console.log('cards', events)
    let cards: string[] = []
    for (let i = 0; i < events.length; i++) {
      if (events[i] == null || events[i]?.player != -1) {
        break;
      }
      cards.push(events[i]?.action!)
    }
    return cards
  }

  getcards(id: number, hand: HandEvent[]): string[] {
    const playercards = hand.filter(x => x.type == 'deal' && x.player == id)
    const cards: string[] = [playercards[0].card!, playercards[1].card!]
    return cards
  }

  setAction(actionId: number, index: number, isAllin: boolean, noBet: boolean): Action {
    let action = Action.Check
    if (index == 0) {
      action = Action.SmallBlind
    } else if (index == 1) {
      action = Action.BigBlind
    } else if (actionId == 0) {
      action = Action.Fold
    } else if (actionId == 1) {
      action = noBet ? Action.Check : Action.Call
    } else if (actionId > 1) {
      action = Action.Raise
    }
    if (isAllin) {
      action = Action.AllIn
    }
    return action
  }

  rewriteHandeventToId(handevents: HandEvent[], players: Players[]): HandEvent[] {
    const newHandevents: HandEvent[] = []
    handevents.forEach(obj => {
      if (obj.player != -1) {
        newHandevents.push({
          type: obj.type,
          player: players[obj.player].id,
          action: obj.action,
          card: obj.card,
          reward: obj.reward,
          handtype: obj.handtype,
          win_chance: obj.win_chance
        })
      } else {
        newHandevents.push({
          type: obj.type,
          player: obj.player,
          action: obj.action,
          card: obj.card,
          reward: obj.reward,
          handtype: obj.handtype
        })
      }
    }
    )
    return newHandevents
  }
}
