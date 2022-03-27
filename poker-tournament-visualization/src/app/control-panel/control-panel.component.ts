import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SyncService } from '../sync/sync.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

export interface Client {
  Id?: string;
  Table?: string;
}

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css'],
})
export class ControlPanelComponent implements OnInit {
  subscription: Subscription | undefined;
  messages: any[] = [];
  public id: string = '';
  public status: string = 'idle';
  isPlaying: boolean = false;
  clients: Client[] = [];
  displayedColumns: string[] = ['Id', 'Table'];

  dataSource = new MatTableDataSource(this.clients);

  constructor(private service: SyncService) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.service.onMessage().subscribe((message) => {
      this.handleMessage(message);
    });
    this.service.connect();
    this.service.sendMessage({ cmd: 'connect', type: 'controlPanel' });
    this.dataSource = new MatTableDataSource(this.clients);
  }

  private handleMessage(message: any) {
    if (message) {
      console.log(message);
      this.messages.push(message);
      if (message['cmd'] == 'ACK') {
        this.id = message['clientId'];
      } else if (message['cmd'] == 'start') {
        this.status = 'start';
      } else if (message['cmd'] == 'clients') {
        const clients: any[] = message['clients'];
        clients
          .filter((x) => {
            return this.clients.findIndex((y) => y.Id == x) == -1;
          })
          .forEach((x) => {
            this.clients.push({ Id: x });
          });

        this.clients = this.clients.filter(
          (x) => clients.findIndex((y) => x.Id == y) != -1
        );
        this.dataSource = new MatTableDataSource(this.clients);
      }
    }
  }

  asStr() {
    return JSON.stringify(this.messages[this.messages.length - 1]);
  }

  startForAll() {
    this.service.sendMessage({ cmd: 'start' });
  }
}
