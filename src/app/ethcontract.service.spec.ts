import { TestBed } from '@angular/core/testing';

import { EthcontractService } from './ethcontract.service';

describe('EthcontractService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EthcontractService = TestBed.get(EthcontractService);
    expect(service).toBeTruthy();
  });
});
