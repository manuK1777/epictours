import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistInfoComponent } from './artist-info.component';

describe('ArtistInfoComponent', () => {
  let component: ArtistInfoComponent;
  let fixture: ComponentFixture<ArtistInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
