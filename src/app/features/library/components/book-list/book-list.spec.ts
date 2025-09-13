import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookList } from './book-list';
import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { InMemoryBookService } from '../../../../core/services/book.service.inmemory';
import { NotificationsService } from '../../../../core/utils/notifications.service';

describe('BookListComponent', () => {
  let fixture: ComponentFixture<BookList>;
  let comp: BookList;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookList],
      providers: [
        { provide: BOOK_SERVICE, useClass: InMemoryBookService },
        NotificationsService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookList);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders table with books', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
  });
});
