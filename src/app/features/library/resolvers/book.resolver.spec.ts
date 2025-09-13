import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap } from '@angular/router';
import { bookResolver } from './book.resolver';
import { BOOK_SERVICE } from '../../../core/services/book.token';
import { InMemoryBookService } from '../../../core/services/book.service.inmemory';
import { IBookService } from '../../../core/services/book.service.contract';

describe('bookResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: BOOK_SERVICE, useClass: InMemoryBookService },
      ],
    });
  });

  it('resolves a book by id', (done) => {
    // minimal mocks for route & state
    const route = {
      paramMap: convertToParamMap({ id: '1' }),
    } as unknown as ActivatedRouteSnapshot;

    const state = {} as RouterStateSnapshot;

    // IMPORTANT: run functional resolver in DI context so inject() works
    const result$ = TestBed.runInInjectionContext(() => bookResolver(route, state));

    (result$ as any).subscribe((book: any) => {
      expect(book?.id).toBe('1');
      done();
    });
  });
});