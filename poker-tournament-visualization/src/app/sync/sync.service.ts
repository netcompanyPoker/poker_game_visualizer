import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Observable, timer, Subject, EMPTY } from 'rxjs';
import {
  retryWhen,
  tap,
  delayWhen,
  switchAll,
  catchError,
} from 'rxjs/operators';
export const WS_ENDPOINT = environment.wsEndpoint;
export const RECONNECT_INTERVAL = environment.reconnectInterval;

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  public id: string | null = null;
  private socket$: WebSocketSubject<unknown> | undefined;
  private messagesSubject$ = new Subject<any>();
  // public messages$ = this.messagesSubject$.pipe(switchAll(), catchError(e => { throw e }));

  constructor() { }

  /**
   * Creates a new WebSocket subject and send it to the messages subject
   * @param cfg if true the observable will be retried.
   */
  public connect(cfg: { reconnect: boolean } = { reconnect: false }): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      this.socket$.subscribe(
        (msg) => {
          console.log('message received: ' + JSON.stringify(msg));
          this.messagesSubject$.next(msg);
        }, // Called whenever there is a message from the server.
        (err) => console.log(err), // Called if at any point WebSocket API signals some kind of error.
        () => console.log('complete') // Called when connection is closed (for whatever reason).
      );
      const messages = this.socket$.pipe(
        cfg.reconnect ? this.reconnect : (o) => o,
        tap({
          error: (error) => console.log('abc' + error),
        }),
        catchError((_) => EMPTY)
      );
      //toDO only next an observable if a new subscription was made double-check this
      // this.messagesSubject$.next(messages);
      // this.messagesSubject$.error((x: any) => console.error('asdf' + x));
      // this.messagesSubject$.complete();
    }
  }

  onMessage(): Observable<any> {
    return this.messagesSubject$.asObservable();
  }

  /**
   * Retry a given observable by a time span
   * @param observable the observable to be retried
   */
  private reconnect(observable: Observable<any>): Observable<any> {
    return observable.pipe(
      retryWhen((errors) =>
        errors.pipe(
          tap((val) => console.log('[Data Service] Try to reconnect', val)),
          delayWhen((_) => timer(RECONNECT_INTERVAL))
        )
      )
    );
  }

  close() {
    if (this.socket$) {
      this.socket$.complete();
    } else {
      console.error('Socket was not defined when tried to be used.');
    }
    this.socket$ = undefined;
  }

  sendMessage(msg: any) {
    if (this.socket$) {
      this.socket$.next(msg);
    } else {
      console.error('Socket was not defined when tried to be used.');
    }
  }

  /**
   * Return a custom WebSocket subject which reconnects after failure
   */
  private getNewWebSocket() {
    return webSocket({
      url: WS_ENDPOINT,
      openObserver: {
        next: () => {
          console.log('[DataService]: connection ok');
        },
      },
      closeObserver: {
        next: () => {
          console.log('[DataService]: connection closed');
          this.socket$ = undefined;
          this.connect({ reconnect: true });
        },
      },
    });
  }
}
