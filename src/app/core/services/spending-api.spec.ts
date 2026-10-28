import { TestBed } from '@angular/core/testing';

import { SpendingApi } from './spending-api';

describe('SpendingApi', () => {
  let service: SpendingApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpendingApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
