import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home } from './home';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {

    const mockActivatedRoute = {
      snapshot: {
        paramMap: new Map(),
        queryParamMap: new Map(),
        data: {},
        params: {},
        queryParams: {}
      },
      params: of({}),
      queryParams: of({}),
      data: of({})
    };
    
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
