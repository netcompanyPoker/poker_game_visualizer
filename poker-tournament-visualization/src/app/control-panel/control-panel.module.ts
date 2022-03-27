import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './control-panel.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [ControlPanelComponent],
  imports: [CommonModule, MatTableModule],
})
export class ControlPanelModule {}
