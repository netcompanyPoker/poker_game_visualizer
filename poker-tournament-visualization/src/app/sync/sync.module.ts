import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncComponent } from './sync.component';
import { SyncService } from './sync.service';

@NgModule({
  declarations: [SyncComponent],
  exports: [SyncComponent],
  imports: [CommonModule],
  providers: [SyncService],
})
export class SyncModule {}
