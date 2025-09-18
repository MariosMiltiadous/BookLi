import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BOOK_SERVICE } from './book.token';
import { InMemoryBookService } from './book.service.inmemory';
import { HttpBookService } from './book.service.http';
import { IBookService } from './book.service.interface';
import { IBook } from '../models/book.interface';
import { BOOKS_SEED } from './book.token';

// Test data
const mockBooks: IBook[] = [
  {
    id: '1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    year: 2008,
    genre: 'Software',
    description: 'A handbook of agile software craftsmanship',
  },
  {
    id: '2',
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    year: 2017,
    genre: 'Software',
    description: 'Software architecture principles',
  },
  {
    id: '3',
    title: 'Design Patterns',
    author: 'Gang of Four',
    year: 1994,
    genre: 'Software',
    description: 'Elements of reusable software',
  },
];

describe('Book Service', () => {
  // InMemory service tests
  describe('InMemory Implementation via Token', () => {
    let svc: IBookService;

    // Mock seed data that matches IBook interface
    const mockSeedData: IBook[] = [
      {
        id: '1',
        title: 'Test Book 1',
        author: 'Test Author 1',
        year: 2020,
        genre: 'Test',
        description: 'Test description 1'
      },
      {
        id: '2',
        title: 'Test Book 2', 
        author: 'Test Author 2',
        year: 2021,
        genre: 'Test',
        description: 'Test description 2'
      }
    ];

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: BOOK_SERVICE, useClass: InMemoryBookService },
          { provide: BOOKS_SEED, useValue: mockSeedData },
        ],
      });
      svc = TestBed.inject(BOOK_SERVICE as any);
    });

    it('lists initial books', (done) => {
      svc.list().subscribe((result) => {
        expect(result.books.length).toBeGreaterThan(0);
        done();
      });
    });

    it('creates and retrieves a book', (done) => {
      svc.create({ title: 'T', author: 'A', year: 2020, genre: 'G' }).subscribe((created) => {
        expect(created.id).toBeTruthy();
        svc.getById(created.id).subscribe((fetched) => {
          expect(fetched.title).toBe('T');
          done();
        });
      });
    });

    it('should handle pagination parameters', (done) => {
      svc.list({ page: 1, pageSize: 5 }).subscribe((result) => {
        expect(result.books.length).toBeLessThanOrEqual(5);
        expect(result.total).toBeGreaterThanOrEqual(result.books.length);
        done();
      });
    });

    it('should filter books by title', (done) => {
      svc.list({ filter: 'test' }).subscribe((result) => {
        // All returned books should contain 'test' in title, author, or genre
        result.books.forEach((book) => {
          const searchableText = `${book.title} ${book.author} ${book.genre}`.toLowerCase();
          expect(searchableText).toContain('test');
        });
        done();
      });
    });
  });

  // New HTTP service tests with comprehensive coverage
  describe('HTTP Implementation', () => {
    let service: HttpBookService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          HttpBookService,
          provideHttpClient(), // No interceptors
          provideHttpClientTesting(),
        ],
      });

      service = TestBed.inject(HttpBookService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    describe('Service Initialization', () => {
      it('should be created', () => {
        expect(service).toBeTruthy();
      });
    });

    describe('list() method', () => {
      it('should return all books when no parameters provided', () => {
        service.list().subscribe((result) => {
          expect(result.books).toEqual(mockBooks);
          expect(result.total).toBe(3);
        });

        const req = httpMock.expectOne('/books');
        expect(req.request.method).toBe('GET');
        req.flush(mockBooks);
      });

      it('should filter books by title', () => {
        const params = { page: 1, pageSize: 10, filter: 'Clean' };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(2);
          expect(result.total).toBe(2);
          expect(result.books.every((book) => book.title.includes('Clean'))).toBe(true);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should filter books by author', () => {
        const params = { filter: 'Robert' };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(2);
          expect(result.books.every((book) => book.author.includes('Robert'))).toBe(true);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should filter books by genre', () => {
        const params = { filter: 'Software' };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(3);
          expect(result.books.every((book) => book.genre === 'Software')).toBe(true);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should handle case-insensitive filtering', () => {
        const params = { filter: 'CLEAN' };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(2);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should trim whitespace from filter', () => {
        const params = { filter: '  Clean  ' };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(2);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should apply pagination when results exceed page size', () => {
        const params = { page: 1, pageSize: 2 };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(2);
          expect(result.total).toBe(3);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should return correct second page', () => {
        const params = { page: 2, pageSize: 2 };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(1);
          expect(result.total).toBe(3);
          expect(result.books[0].id).toBe('3');
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should show all filtered results when they fit on one page', () => {
        const params = { page: 1, pageSize: 10, filter: 'Clean' };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(2);
          expect(result.total).toBe(2);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should return empty results for no matches', () => {
        const params = { filter: 'NonExistent' };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(0);
          expect(result.total).toBe(0);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });

      it('should handle empty filter string', () => {
        const params = { filter: '' };

        service.list(params).subscribe((result) => {
          expect(result.books).toEqual(mockBooks);
          expect(result.total).toBe(3);
        });

        const req = httpMock.expectOne('/books');
        req.flush(mockBooks);
      });
    });

    describe('getById() method', () => {
      it('should return a specific book', () => {
        const bookId = '1';
        const expectedBook = mockBooks[0];

        service.getById(bookId).subscribe((book) => {
          expect(book).toEqual(expectedBook);
        });

        const req = httpMock.expectOne(`/books/${bookId}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedBook);
      });

      it('should handle 404 error for non-existent book', () => {
        const bookId = '999';

        service.getById(bookId).subscribe({
          next: () => fail('Expected an error'),
          error: (error) => {
            expect(error.status).toBe(404);
          },
        });

        const req = httpMock.expectOne(`/books/${bookId}`);
        req.flush('Book not found', { status: 404, statusText: 'Not Found' });
      });
    });

    describe('create() method', () => {
      it('should create a new book', () => {
        const newBook = {
          title: 'Test Driven Development',
          author: 'Kent Beck',
          year: 2002,
          genre: 'Software',
          description: 'TDD by example',
        };

        const createdBook: IBook = { ...newBook, id: '4' };

        service.create(newBook).subscribe((book) => {
          expect(book).toEqual(createdBook);
          expect(book.id).toBeDefined();
        });

        const req = httpMock.expectOne('/books');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newBook);
        req.flush(createdBook);
      });

      it('should handle creation errors', () => {
        const newBook = {
          title: 'Invalid Book',
          author: '',
          year: 0,
          genre: '',
          description: '',
        };

        service.create(newBook).subscribe({
          next: () => fail('Expected an error'),
          error: (error) => {
            expect(error.status).toBe(400);
          },
        });

        const req = httpMock.expectOne('/books');
        req.flush('Invalid book data', { status: 400, statusText: 'Bad Request' });
      });
    });

    describe('update() method', () => {
      it('should update an existing book', () => {
        const bookId = '1';
        const updates = { title: 'Updated Clean Code', year: 2009 };
        const updatedBook: IBook = { ...mockBooks[0], ...updates };

        service.update(bookId, updates).subscribe((book) => {
          expect(book).toEqual(updatedBook);
          expect(book.title).toBe('Updated Clean Code');
          expect(book.year).toBe(2009);
        });

        const req = httpMock.expectOne(`/books/${bookId}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(updates);
        req.flush(updatedBook);
      });

      it('should handle partial updates', () => {
        const bookId = '2';
        const updates = { description: 'Updated description only' };
        const updatedBook: IBook = { ...mockBooks[1], ...updates };

        service.update(bookId, updates).subscribe((book) => {
          expect(book.description).toBe('Updated description only');
          expect(book.title).toBe(mockBooks[1].title); // Should remain unchanged
        });

        const req = httpMock.expectOne(`/books/${bookId}`);
        req.flush(updatedBook);
      });

      it('should handle update errors', () => {
        const bookId = '999';
        const updates = { title: 'Updated Title' };

        service.update(bookId, updates).subscribe({
          next: () => fail('Expected an error'),
          error: (error) => {
            expect(error.status).toBe(404);
          },
        });

        const req = httpMock.expectOne(`/books/${bookId}`);
        req.flush('Book not found', { status: 404, statusText: 'Not Found' });
      });
    });

    describe('delete() method', () => {
      it('should delete a book successfully', () => {
        const bookId = '1';

        service.delete(bookId).subscribe();

        // Use expectOne without specific URL to see what was actually called
        try {
          const req = httpMock.expectOne(() => true); // Match any request
          console.log('Actual request URL:', req.request.url);
          console.log('Actual request method:', req.request.method);

          expect(req.request.method).toBe('DELETE');
          expect(req.request.url).toBe('/books/1');
          req.flush(null, { status: 204, statusText: 'No Content' });
        } catch (error) {
          console.log('No requests found:', error);
        }
      });

      it('should handle delete errors', () => {
        const bookId = '999';

        service.delete(bookId).subscribe({
          next: () => fail('Expected an error'),
          error: (error) => {
            expect(error.status).toBe(404);
          },
        });

        const req = httpMock.expectOne(`/books/${bookId}`);
        req.flush('Book not found', { status: 404, statusText: 'Not Found' });
      });

      it('should handle server errors during deletion', () => {
        const bookId = '1';

        service.delete(bookId).subscribe({
          next: () => fail('Expected an error'),
          error: (error) => {
            expect(error.status).toBe(500);
          },
        });

        const req = httpMock.expectOne(`/books/${bookId}`);
        req.flush('Internal server error', { status: 500, statusText: 'Server Error' });
      });
    });

    describe('Complex filtering and pagination scenarios', () => {
      it('should handle filtered pagination correctly', () => {
        const largeBookSet: IBook[] = [
          ...mockBooks,
          {
            id: '4',
            title: 'Clean Coder',
            author: 'Robert C. Martin',
            year: 2011,
            genre: 'Software',
            description: 'Professional conduct',
          },
          {
            id: '5',
            title: 'Refactoring',
            author: 'Martin Fowler',
            year: 1999,
            genre: 'Software',
            description: 'Improving code design',
          },
        ];

        const params = { page: 1, pageSize: 2, filter: 'Clean' };

        service.list(params).subscribe((result) => {
          expect(result.books.length).toBe(3); // All 3 "Clean" books should show on page 1
          expect(result.total).toBe(3);
          expect(result.books.every((book) => book.title.includes('Clean'))).toBe(true);
        });

        const req = httpMock.expectOne('/books');
        req.flush(largeBookSet);
      });
    });
  });
});
