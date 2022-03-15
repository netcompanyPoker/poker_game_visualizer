import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokerActionComponent } from './poker-action.component';

describe('PokerActionComponent', () => {
  let component: PokerActionComponent;
  let fixture: ComponentFixture<PokerActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokerActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PokerActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
