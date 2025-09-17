import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookOverview } from './book-overview';

describe('BookOverview', () => {
  let component: BookOverview;
  let fixture: ComponentFixture<BookOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
