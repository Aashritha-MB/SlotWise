import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotCard } from './slot-card';

describe('SlotCard', () => {
  let component: SlotCard;
  let fixture: ComponentFixture<SlotCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
