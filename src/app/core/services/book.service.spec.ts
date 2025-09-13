import { TestBed } from '@angular/core/testing';
import { BOOK_SERVICE } from './book.token';
import { InMemoryBookService } from './book.service.inmemory';
import { IBookService } from './book.service.contract';

describe('Book service via token', () => {
  let svc: IBookService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: BOOK_SERVICE, useClass: InMemoryBookService }],
    });
    svc = TestBed.inject(BOOK_SERVICE as any);
  });

  it('lists initial books', (done) => {
    svc.list().subscribe(list => {
      expect(list.length).toBeGreaterThan(0);
      done();
    });
  });

  it('creates and retrieves a book', (done) => {
    svc.create({ title: 'T', author: 'A', year: 2020, genre: 'G' }).subscribe(created => {
      expect(created.id).toBeTruthy();
      svc.getById(created.id).subscribe(fetched => {
        expect(fetched.title).toBe('T');
        done();
      });
    });
  });
});
