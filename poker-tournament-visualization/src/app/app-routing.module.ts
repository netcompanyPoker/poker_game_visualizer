import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { PokerGameComponent } from './poker-game/poker-game.component';

const routes: Routes = [
  { path: 'cp', component: ControlPanelComponent },
  { path: 'app', component: PokerGameComponent },
  { path: '**', redirectTo: '/app', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      { enableTracing: true } // <-- debugging purposes only)],
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
