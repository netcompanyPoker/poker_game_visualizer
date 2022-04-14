import { Component, OnChanges, OnInit } from '@angular/core';
import { Game, NewPokerGameService, Stage } from './new-poker-game.service';
import { TestPokerGameService } from './test-poker-game.service';
import { Subscription } from 'rxjs';
import { SyncService } from '../sync/sync.service';
import { HighlightService } from './highlight.service';

@Component({
  selector: 'app-poker-game',
  templateUrl: './poker-game.component.html',
  styleUrls: ['./poker-game.component.css']
})
export class PokerGameComponent implements OnInit, OnChanges {
  syncSubscription: Subscription | undefined;
  fullGame: Game;
  game: Game;
  stage: Stage;
  actionIdx: number = 0;
  handIdx: number = 0;
  isPlay: boolean = false;
  speedInput: number = 4;
  speed: number = 200;
  handCountInput: number = 5;
  handCount: number = 11;
  interestingHands: number[] = []
  interestingHandIdx = 0;
  interval: any;

  constructor(
    private newPokerGameService: NewPokerGameService, 
    private testPokerGameService: TestPokerGameService, 
    private highlightService: HighlightService, 
    private syncService: SyncService) {
    this.fullGame = this.newPokerGameService.getTransformedData()
    this.game = this.highlightService.getHighlightedHands(newPokerGameService.game,this.fullGame) ;    
    this.stage = Stage.Preflop;
  }

  ngOnInit(): void {
    this.syncSubscription = this.syncService
      .onMessage()
      .subscribe((message) => {
        if (message && message['cmd'] == 'start') {
          if (!this.isPlay) {
            this.toggle();
          }
        } else if (message && message['cmd'] == 'load') {
          const jsonToPlay = message['table'].find((x: any) => x['id'] == this.syncService.id)['table']
          console.log(jsonToPlay)
        }
      });
  }

  ngOnChanges(): void {
  }

  toggle() {
    this.isPlay = !this.isPlay;
    if (this.isPlay) {
      let endReached = false;

      this.interestingHandIdx = 0;
      let interestingHands = this.game.hands;
      this.handSliderOnChange(interestingHands[this.interestingHandIdx].handId);
      this.interval = setInterval(() => {
        if (this.isPlay) {
          if (this.actionIdx < this.getMaxActions()) {
            this.sliderOnChange(this.actionIdx + 1);
          } else if (this.actionIdx == this.getMaxActions() && endReached) {
            this.interestingHandIdx += 1;
            endReached = false;
            if (this.interestingHandIdx < this.handCount) {
              this.handSliderOnChange(interestingHands[this.interestingHandIdx].handId);
            } else {
              this.handSliderOnChange(this.getMaxHands());
              this.sliderOnChange(this.getMaxActions());
              this.toggle();
            }
          } else {
            endReached = true;
          }

        }
      }, this.speed * this.game.hands[this.interestingHandIdx].steps[this.actionIdx].timeconstant);
    } else {
      if (this.interval) {
        clearInterval(this.interval)
      }
    }
  }

  setStage(val?: number): void {
    const newValue = val ?? this.actionIdx;
    let currentStage = Stage.Preflop;
    let stagelist = this.game.hands[this.handIdx].steps.slice(0, newValue+1).filter(obj => obj.boardState?.stage != null)
    this.stage = stagelist.length > 0 ? stagelist[stagelist.length-1].boardState!.stage! : currentStage;
  }

  getMaxActions(): number {
    const actions = this.game.hands[this.handIdx].steps.length - 1;
    return actions; // +1 for the show-down
  }

  // getCurrentAction(): History {
  //   const idx = this.actionIdx;
  //   return this.game.hands[this.handIdx].history[idx];
  // }

  sliderOnChange(val: any) {
    this.setStage(val)
    this.actionIdx = val
  }

  getMaxHands(): number {
    const hands = this.fullGame.hands.length - 1;
    return hands; // +1 for the show-down
  }

  handSliderOnChange(val: any) {
    this.handIdx = val;
    this.actionIdx = 0;
    // this.setStage(0)
  }

  // speedOnChange(){
  //   if(Number(this.speedInput)){
  //     this.speed = Number(this.speedInput);
  //     this.resetSliders();

  //   }
  // }

  // handCountOnChange(){
  //   if(Number(this.handCountInput)){
  //     this.handCount = Number(this.handCountInput)
  //     this.interestingHandIdx = 0;
  //     this.resetSliders();
  //   }
  // }

  // resetSliders(){
  //   this.sliderOnChange(0);
  //     this.handSliderOnChange(0);
  //     if(this.isPlay){
  //       this.toggle();
  //     }
  // }
}

