import { TestBed } from '@angular/core/testing';

import { GoogleSignInService } from './google-sign-in.service';

describe('GoogleSignInService', () => {
  let service: GoogleSignInService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleSignInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
