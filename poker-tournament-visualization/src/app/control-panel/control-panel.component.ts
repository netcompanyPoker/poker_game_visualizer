import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SyncService } from '../sync/sync.service';
import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'; // TODO: Update use of MatLegacyTableDataSource, etc.
import { UntypedFormArray, UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';

export interface Client {
  Id?: string;
  Table?: string;
}

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css'],
})
export class ControlPanelComponent implements OnInit, OnDestroy {
  subscription: Subscription | undefined;
  messages: any[] = [];
  public id: string = '';
  public status: string = 'idle';
  isPlaying: boolean = false;
  clients: Client[] = [];
  displayedColumns: string[] = ['id', 'table'];
  form: UntypedFormGroup; // TODO: Update UntypedForm<X> to include generic type parameter

  dataSource = new MatTableDataSource(this.clients);

  constructor(
    private service: SyncService,
    private _formBuilder: UntypedFormBuilder
  ) {
    this.form = this._formBuilder.group({
      tables: this._formBuilder.array([])
    });
  }

  get tables(): UntypedFormArray {
    return this.form.get('tables') as UntypedFormArray;
  }

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
            this.form.setControl('tables', this.getClientsAsFormArray())
            // this.form.addControl('tables', this.mapToGroup({ Id: x }))
          });

        this.clients = this.clients.filter(
          (x) => clients.findIndex((y) => x.Id == y) != -1
        );
        this.dataSource = new MatTableDataSource(this.clients);
      }
    }
  }

  getClientsAsFormArray(): UntypedFormArray {
    const fgs = this.clients.map(x => {
      return this.mapToGroup(x);
    })
    return new UntypedFormArray(fgs);
  }

  private mapToGroup(x: Client) {
    const fg = new UntypedFormGroup({
      id: new UntypedFormControl(x.Id),
      table: new UntypedFormControl(x.Table),
    });
    return fg;
  }

  onTableChange(event: any, element: any) {
    console.log(event)
    const client = this.clients.find(x => x.Id == element.value.id)
    if (client) {
      if (event?.target?.value) {
        client.Table = event?.target.value;
      }
    }
  }

  asStr() {
    return JSON.stringify(this.messages[this.messages.length - 1]);
  }

  startForAll() {
    this.service.sendMessage({ cmd: 'start', tables: this.form.value['tables'] });
    this.status = "sent start command"
  }

  loadForAll() {
    this.service.sendMessage({ cmd: 'load', tables: this.form.value['tables'] });
    this.status = "sent load command"
  }
}
