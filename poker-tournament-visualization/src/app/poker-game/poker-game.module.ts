import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokerGameComponent } from './poker-game.component';
import { PokerGameService } from './poker-game.service';
import { PokerTableComponent } from '../poker-table/poker-table.component';
import { PokerPlayerComponent } from '../poker-player/poker-player.component';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { PokerActionComponent } from '../poker-action/poker-action.component';
import { CardGroupComponent } from '../card-group/card-group.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { StackerComponent } from '../stacker/stacker.component';
import { ChipsComponent } from '../chips/chips.component';

@NgModule({
  declarations: [
    PokerGameComponent,
    PokerTableComponent,
    PokerPlayerComponent,
    PokerActionComponent,
    CardGroupComponent,
    StackerComponent,
    ChipsComponent,
  ],
  imports: [
    CommonModule,
    MatSliderModule,
    MatGridListModule,
    FormsModule,    
  ],
  exports: [
    PokerGameComponent,
  ],
  providers: [
    PokerGameService,
  ]
})
export class PokerGameModule { }
