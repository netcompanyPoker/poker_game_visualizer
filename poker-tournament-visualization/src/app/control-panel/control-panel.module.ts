import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './control-panel.component';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

@NgModule({
  declarations: [ControlPanelComponent],
  imports: [
    CommonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatInputModule,
  ],
})
export class ControlPanelModule { }
