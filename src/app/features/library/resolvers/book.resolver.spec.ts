import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap, Router } from '@angular/router';
import { bookResolver } from './book.resolver';
import { BOOK_SERVICE } from '../../../core/services/book.token';
import { HttpBookService } from '../../../core/services/book.service.http';
import { NotificationsService } from '../../../core/utils/notifications.service';

describe('bookResolver', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Create mock services
    const mockNotificationsService = jasmine.createSpyObj('NotificationsService', ['error']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: BOOK_SERVICE, useClass: HttpBookService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: Router, useValue: mockRouter },
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('resolves a book by id', (done) => {
    const mockBook = {
      id: '1',
      title: 'Test Book',
      author: 'Test Author',
      year: 2020,
      genre: 'Test',
      description: 'Test description'
    };

    const route = {
      paramMap: convertToParamMap({ id: '1' }),
    } as unknown as ActivatedRouteSnapshot;

    const state = {} as RouterStateSnapshot;

    const result$ = TestBed.runInInjectionContext(() => bookResolver(route, state));

    (result$ as any).subscribe((book: any) => {
      expect(book?.id).toBe('1');
      expect(book?.title).toBe('Test Book');
      done();
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('/books/1');
    req.flush(mockBook);
  });

  it('handles error when book not found', (done) => {
    const route = {
      paramMap: convertToParamMap({ id: '999' }),
    } as unknown as ActivatedRouteSnapshot;

    const state = {} as RouterStateSnapshot;

    const result$ = TestBed.runInInjectionContext(() => bookResolver(route, state));

    (result$ as any).subscribe((book: any) => {
      expect(book).toBeNull(); // Resolver should return null on error
      done();
    });

    // Mock 404 error
    const req = httpMock.expectOne('/books/999');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });
});