import { Component, OnChanges, OnInit, Output } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { PokerGame, PokerGameService, Stage, History } from './poker-game.service';

@Component({
  selector: 'app-poker-game',
  templateUrl: './poker-game.component.html',
  styleUrls: ['./poker-game.component.css']
})
export class PokerGameComponent implements OnInit, OnChanges {
  games: PokerGame[];
  gamesUI: any[];
  selectedGameIdx: number = 0;
  game: PokerGame;
  sortedHands: { idx: number; score: number; }[];
  stage: Stage;
  actionIdx: number = 0;
  handIdx: number = 0;
  isPlay: boolean = false;
  speedInput: number = 4;
  speed: number = 4;
  handCountInput: number = 5;
  handCount: number = 5;
  interestingHands: number[] = []
  interestingHandIdx = 0;
  interval: any;

  constructor(private pokerGameService: PokerGameService) {
    this.games = this.pokerGameService.game
    this.game = this.games[0];
    this.gamesUI = []
    for(let i = 0; i<this.games.length; i++){
      let g = this.games[i];
      this.gamesUI.push({
        "idx": i, 
        "number": g.game_nbr, 
        "stage_num":Number(g.tournament_stage), 
        "stage_string": this.getTournamentStageString(g.tournament_stage)
      });
    }
    this.sortedHands = this.getSortedHands()
    this.stage = Stage.Preflop;
  }

  ngOnInit(): void {
    const element = document.getElementById('slider');
    setTimeout(function() { element?.focus() }, 20);    
  }

  ngOnChanges(): void {
    console.log("game changes!")
    this.setStage()
  }

  getTournamentStageString(stageString: String): String{
    switch(stageString){
      case "1":
        return "Grand Final";
      case "2":
        return "Semi Final";
      case "3":
        return "Quater Final";
      case "4":
        return "Round of 8";
      case "5":
        return "Round of 16";
    }
    return stageString;
  }

  getSortedHands(){
    let res: { idx: number; score: number; }[] = [];
    this.game.hands.forEach((h) =>{
      res.push({"idx": h.nbr-1, "score": h.abs_reward})
    });
    res.sort((a,b) => b.score - a.score)
    console.log(res)
    return res
  }

  getTopHands(){
    return this.sortedHands.slice(0,this.handCount).sort((a,b) => a.idx - b.idx)
  }

  toggle(){
    this.isPlay = !this.isPlay;
    if(this.isPlay){
      let endReached = false;

      this.interestingHandIdx = 0;
      let interestingHands = this.getTopHands();
      this.handSliderOnChange(interestingHands[this.interestingHandIdx].idx);
      this.interval = setInterval(() => {
        if (this.isPlay){
          if (this.actionIdx < this.getMaxActions()){
            this.sliderOnChange(this.actionIdx + 1);
          }else if(this.actionIdx == this.getMaxActions() && endReached){
            this.interestingHandIdx += 1;
            endReached = false;
            if (this.interestingHandIdx < this.handCount){
              this.handSliderOnChange(interestingHands[this.interestingHandIdx].idx);
            }else{
              this.handSliderOnChange(this.getMaxHands());
              this.sliderOnChange(this.getMaxActions());
              this.toggle();
            }
          }else{
            endReached = true;
          }
          
        }
      }, this.speed * 1000);
    }else{
      if(this.interval){
        clearInterval(this.interval)
      }
    }
  }

  isGameSelected(game:any){
    return game.idx == this.selectedGameIdx;
  }

  gameClick(game:any){
    this.selectedGameIdx = game.idx;
    this.game = this.games[this.selectedGameIdx];
    this.sortedHands = this.getSortedHands();
    this.stage = Stage.Preflop;
    this.resetSliders();
  }

  setStage(val?: number): void {
    const newValue = val ?? this.actionIdx;
    let currentStage = Stage.Preflop;
    for (let index = 0; index <= newValue; index++) {
      const action = this.game.hands[this.handIdx].history[index].action;
      if (action == Stage.Preflop) {
        currentStage = Stage.Preflop;
      } else if (action == Stage.Flop) {
        currentStage = Stage.Flop;
      } else if (action == Stage.Turn) {
        currentStage = Stage.Turn;
      } else if (action == Stage.River) {
        currentStage = Stage.River;
      } else if (action == Stage.EndHidden) {
        currentStage = Stage.EndHidden;
      }else if (action == Stage.Showdown) {
        currentStage = Stage.Showdown;
      }
    }
    this.stage = currentStage;
  }

  getMaxActions(): number {
    const actions = this.game.hands[this.handIdx].history.length-1;
    return actions; // +1 for the show-down
  }

  getCurrentAction(): History {
    const idx = this.actionIdx;
    return this.game.hands[this.handIdx].history[idx];
  }

  sliderOnChange(val: any) {
    this.setStage(val)
    this.actionIdx = val
  }

  getMaxHands(): number {
    const hands = this.game.hands.length-1;
    return hands; // +1 for the show-down
  }
  handSliderOnChange(val: any) {
    this.handIdx = val;
    this.actionIdx = 0;
    this.setStage(0)
  }

  speedOnChange(){
    if(Number(this.speedInput)){
      this.speed = Number(this.speedInput);
      this.resetSliders();
      
    }
  }

  handCountOnChange(){
    if(Number(this.handCountInput)){
      this.handCount = Number(this.handCountInput)
      this.interestingHandIdx = 0;
      this.resetSliders();
    }
  }

  resetSliders(){
    this.sliderOnChange(0);
      this.handSliderOnChange(0);
      if(this.isPlay){
        this.toggle();
      }
  }
}

