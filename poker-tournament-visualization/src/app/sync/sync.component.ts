import { Component, OnInit } from '@angular/core';
import { SyncService } from './sync.service';
import { Observable, timer, Subject, EMPTY } from 'rxjs';
import { retryWhen, tap, delayWhen, switchAll, catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css']
})
export class SyncComponent implements OnInit {

  public liveData$: Observable<any> | undefined;

  constructor(private service: SyncService) {
  }

  ngOnInit(): void {
    this.service.connect();
    this.liveData$ = this.service.messages$.pipe(
      map((rows: any) => {
        console.log("rows: " + rows)
        if (rows) {
          return rows.data;
        } else {
          console.error("No rows ...")
        }
      }),
      catchError(error => { throw error }),
      tap({
        error: error => console.log('[Live component] Error:', error),
        complete: () => console.log('[Live component] Connection Closed')
      }
      )
    );
    this.service.sendMessage("Hi from angular!");
  }

  asStr() {
    return this.liveData$
  }
}
