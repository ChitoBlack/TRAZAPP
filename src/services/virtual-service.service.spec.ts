import { TestBed } from '@angular/core/testing';

import { VirtualServiceService } from './virtual-service.service';

describe('VirtualServiceService', () => {
  let service: VirtualServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirtualServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
