import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BvnKycComponent } from './bvn-kyc.component';

describe('BvnKycComponent', () => {
  let component: BvnKycComponent;
  let fixture: ComponentFixture<BvnKycComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BvnKycComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BvnKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
