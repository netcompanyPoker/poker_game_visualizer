import { TestBed } from '@angular/core/testing';

import { PokerGameService } from './poker-game.service';

describe('PokerGameService', () => {
  let service: PokerGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokerGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
