import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NesButtonComponent } from './nes-button.component';

describe('NesButtonComponent', () => {
  let component: NesButtonComponent;
  let fixture: ComponentFixture<NesButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NesButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NesButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
