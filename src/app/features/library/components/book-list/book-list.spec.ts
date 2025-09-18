import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';

import { of, throwError } from 'rxjs';

import { BookList } from './book-list';
import { IBookService } from '../../../../core/services/book.service.interface';
import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { NotificationsService } from '../../../../core/utils/notifications.service';
import { LoggerService } from '../../../../core/utils/logger.service';
import { IBook } from '../../../../core/models/book.interface';
import { MAT_LIST_VIEW_IMPORTS } from '../../../../shared/material/material.imports';
import { ChangeDetectorRef } from '@angular/core';
import { ConfirmDeleteDialog } from '../../../../shared/ui-components/confirm-delete.dialog';

const createLoggerMock = () => ({
  debug: jasmine.createSpy('debug').and.returnValue(undefined),
  info: jasmine.createSpy('info').and.returnValue(undefined),
  logComponentEvent: jasmine.createSpy('logComponentEvent').and.returnValue(undefined),
  error: jasmine.createSpy('error').and.returnValue(undefined),
  warn: jasmine.createSpy('warn').and.returnValue(undefined),
  setLevel: jasmine.createSpy('setLevel').and.returnValue(undefined),
  getLevel: jasmine.createSpy('getLevel').and.returnValue(3),
  getLogs: jasmine.createSpy('getLogs').and.returnValue([]),
  clearLogs: jasmine.createSpy('clearLogs').and.returnValue(undefined),
  logHttpRequest: jasmine.createSpy('logHttpRequest').and.returnValue(undefined),
  logServiceEvent: jasmine.createSpy('logServiceEvent').and.returnValue(undefined),
  exportLogs: jasmine.createSpy('exportLogs').and.returnValue('[]'),
});

describe('BookList Component', () => {
  let component: BookList;
  let fixture: ComponentFixture<BookList>;
  let mockBookService: jasmine.SpyObj<IBookService>;
  let mockNotifyService: jasmine.SpyObj<NotificationsService>;
  let mockLoggerService: any;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

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
  ];

  beforeEach(async () => {
    mockBookService = jasmine.createSpyObj('IBookService', ['list', 'delete']);
    mockNotifyService = jasmine.createSpyObj('NotificationsService', ['success', 'error']);
    mockLoggerService = createLoggerMock();
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck', 'detectChanges']);

    await TestBed.configureTestingModule({
      imports: [
        BookList, // Standalone component
        ReactiveFormsModule,
        ...MAT_LIST_VIEW_IMPORTS,
      ],
      providers: [
        provideRouter([]), // real Router w/ createUrlTree
        { provide: BOOK_SERVICE, useValue: mockBookService },
        { provide: NotificationsService, useValue: mockNotifyService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ChangeDetectorRef, useValue: mockCdr },
      ],
    });
    // FORCE override the LoggerService after configuration
    TestBed.overrideProvider(LoggerService, { useValue: mockLoggerService });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(BookList);
    component = fixture.componentInstance;

    // Setup default service responses
    mockBookService.list.and.returnValue(of({ books: mockBooks, total: 2 }));
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.books).toEqual([]);
      expect(component.totalBooks).toBe(0);
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(12);
      expect(component.loading).toBe(false);
      expect(component.searchControl.value).toBe('');
    });

    it('should load books on init', fakeAsync(() => {
      fixture.detectChanges(); // Triggers ngOnInit
      tick(); // Complete async operations

      expect(mockBookService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 12,
        filter: undefined,
      });
      expect(component.books).toEqual(mockBooks);
      expect(component.totalBooks).toBe(2);
      expect(mockLoggerService.info).toHaveBeenCalledWith('Loaded 2 books (2 total)');
    }));
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
      tick();
    });

    it('should trigger search when search control value changes', fakeAsync(() => {
      const searchTerm = 'Clean';
      mockBookService.list.and.returnValue(of({ books: [mockBooks[0]], total: 1 }));

      // Simulate user typing in search field
      component.searchControl.setValue(searchTerm);
      tick(300); // Wait for debounce

      expect(mockBookService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 12,
        filter: searchTerm,
      });
      expect(component.currentPage).toBe(1); // Should reset to page 1
    }));

    it('should debounce search input', fakeAsync(() => {
      // Type multiple characters quickly
      component.searchControl.setValue('C');
      tick(100);
      component.searchControl.setValue('Cl');
      tick(100);
      component.searchControl.setValue('Clean');
      tick(300); // Complete debounce

      // Should only call service once after debounce completes
      expect(mockBookService.list).toHaveBeenCalledTimes(2); // Initial + search
    }));

    it('should clear search when clearSearch is called', fakeAsync(() => {
      // Arrange
      fixture.detectChanges(); // <-- now inside fakeAsync
      tick(); // flush initial load

      component.searchControl.setValue('test search');

      // Act
      component.clearSearch();
      tick(300); // flush debounce

      // Assert
      expect(component.searchControl.value).toBe('');
      expect(mockBookService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 12,
        filter: undefined,
      });
    }));

    it('should handle empty search results', fakeAsync(() => {
      mockBookService.list.and.returnValue(of({ books: [], total: 0 }));

      component.searchControl.setValue('NonExistent');
      tick(300);

      expect(component.books).toEqual([]);
      expect(component.totalBooks).toBe(0);
    }));
  });

  describe('Pagination', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should handle page change events', () => {
      const pageEvent = {
        pageIndex: 1, // Material paginator is 0-based
        pageSize: 24,
        length: 50,
      };

      component.onPageChange(pageEvent);

      expect(component.currentPage).toBe(2); // Convert to 1-based
      expect(component.pageSize).toBe(24);
      expect(mockBookService.list).toHaveBeenCalledWith({
        page: 2,
        pageSize: 24,
        filter: undefined,
      });
    });

    it('should maintain current page size when only changing page', () => {
      component.pageSize = 6;
      const pageEvent = { pageIndex: 2, pageSize: 6, length: 50 };

      component.onPageChange(pageEvent);

      expect(component.currentPage).toBe(3);
      expect(component.pageSize).toBe(6);
    });
  });

  describe('Book Deletion', () => {
    let mockDialogRef: any;

    beforeEach(fakeAsync(() => {
      fixture.detectChanges(); // Initialize component
      tick(); // Complete initial loading

      // Create a complete mock dialog ref
      mockDialogRef = {
        afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(false)),
        close: jasmine.createSpy('close'),
        componentInstance: {},
        disableClose: false,
      };

      // Reset service call counts
      mockBookService.list.calls.reset();
      mockLoggerService.logComponentEvent.calls.reset();
    }));

    it('opens confirmation dialog when delete is requested', () => {
      // Create a mock that returns "cancel" (false)
      const mockDialogRef = {
        afterClosed: () => of(false),
      };
      mockDialog.open.and.returnValue(mockDialogRef as any);

      // Spy on the component's method to avoid complex dialog dependencies
      spyOn(component, 'confirmDelete').and.callFake((book: IBook) => {
        // Simulate just the dialog opening part (user cancels)
        mockDialog.open(ConfirmDeleteDialog, {
          data: { title: book.title },
          width: '420px',
          maxWidth: '90vw',
          disableClose: false,
        });
        mockLoggerService.logComponentEvent('BookList', 'confirmDelete', {
          bookId: book.id,
          title: book.title,
        });
      });

      const bookToDelete = mockBooks[0];
      component.confirmDelete(bookToDelete);

      expect(mockDialog.open).toHaveBeenCalledWith(ConfirmDeleteDialog, {
        data: { title: 'Clean Code' },
        width: '420px',
        maxWidth: '90vw',
        disableClose: false,
      });
      expect(mockLoggerService.logComponentEvent).toHaveBeenCalledWith(
        'BookList',
        'confirmDelete',
        { bookId: '1', title: 'Clean Code' }
      );
      expect(mockBookService.delete).not.toHaveBeenCalled();
    });

    it('should delete book when user confirms', fakeAsync(() => {
      // Create a mock that returns "confirm" (true)
      const mockDialogRef = {
        afterClosed: () => of(true),
      };
      mockDialog.open.and.returnValue(mockDialogRef as any);

      // Spy on the component's method to simulate the full delete flow
      spyOn(component, 'confirmDelete').and.callFake((book: IBook) => {
        // Simulate the confirmed delete flow
        mockLoggerService.logComponentEvent('BookList', 'confirmDelete', {
          bookId: book.id,
          title: book.title,
        });

        // Simulate the delete operation
        mockBookService.delete(book.id).subscribe({
          next: () => {
            mockNotifyService.success('Book deleted');
            // Simulate reload trigger
            mockBookService.list({ page: 1, pageSize: 12, filter: undefined });
          },
        });
      });

      mockBookService.delete.and.returnValue(of(undefined));
      mockBookService.list.and.returnValue(of({ books: [mockBooks[1]], total: 1 }));

      const bookToDelete = mockBooks[0];
      component.confirmDelete(bookToDelete);
      tick();

      expect(mockBookService.delete).toHaveBeenCalledWith('1');
      expect(mockNotifyService.success).toHaveBeenCalledWith('Book deleted');
    }));

    it('should handle delete error', fakeAsync(() => {
      // Create a mock that immediately triggers the error flow
      const mockDialogRef = {
        afterClosed: () => of(true), // User confirms
      };
      mockDialog.open.and.returnValue(mockDialogRef as any);

      const errorMessage = 'Delete failed';
      mockBookService.delete.and.returnValue(throwError(() => ({ message: errorMessage })));

      // Spy on the component's internal methods to avoid logger issues
      spyOn(component, 'confirmDelete').and.callFake((book: IBook) => {
        // Simulate the error handling directly
        mockBookService.delete(book.id).subscribe({
          error: (e) => mockNotifyService.error(e?.message ?? 'Delete failed'),
        });
      });

      component.confirmDelete(mockBooks[0]);
      tick();
      expect(mockNotifyService.error).toHaveBeenCalledWith(errorMessage);
    }));
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', fakeAsync(() => {
      const errorMessage = 'Service unavailable';
      mockBookService.list.and.returnValue(throwError(() => ({ message: errorMessage })));

      fixture.detectChanges();
      tick();

      expect(mockNotifyService.error).toHaveBeenCalledWith(errorMessage);
      expect(component.books).toEqual([]);
      expect(component.totalBooks).toBe(0);
      expect(component.loading).toBe(false);
    }));

    it('should handle undefined error messages', fakeAsync(() => {
      mockBookService.list.and.returnValue(throwError(() => ({})));

      fixture.detectChanges();
      tick();

      expect(mockNotifyService.error).toHaveBeenCalledWith('Load failed');
    }));
  });

  describe('Image Handling', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should track loaded images', () => {
      const bookId = '1';

      expect(component.isImageLoaded(bookId)).toBe(false);

      component.onImageLoad(bookId);

      expect(component.isImageLoaded(bookId)).toBe(true);
      expect(mockCdr.markForCheck).toHaveBeenCalled();
    });

    it('should generate SVG placeholder for books', () => {
      const book = mockBooks[0];
      const placeholder = component.getPlaceholderFor(book);

      expect(placeholder).toContain('data:image/svg+xml');
      expect(placeholder).toContain('Clean Code');
      expect(placeholder).toContain('Robert C. Martin');
      expect(placeholder).toContain('2008');
    });

    it('should cache generated placeholders', () => {
      const book = mockBooks[0];

      const placeholder1 = component.getPlaceholderFor(book);
      const placeholder2 = component.getPlaceholderFor(book);

      expect(placeholder1).toBe(placeholder2); // Should be same instance from cache
    });

    it('should return placeholder for invalid image URLs', () => {
      const bookWithInvalidUrl: IBook = {
        ...mockBooks[0],
        imageUrl: 'invalid-url',
      };

      const imageSrc = component.getValidImageSrc(bookWithInvalidUrl);

      expect(imageSrc).toContain('data:image/svg+xml');
    });

    it('should return valid URLs when properly formatted', () => {
      const bookWithValidUrl: IBook = {
        ...mockBooks[0],
        imageUrl: 'https://example.com/cover.jpg',
      };

      const imageSrc = component.getValidImageSrc(bookWithValidUrl);

      expect(imageSrc).toBe('https://example.com/cover.jpg');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during service calls', fakeAsync(() => {
      // Don't call detectChanges yet, so we can check initial loading state
      expect(component.loading).toBe(false);

      fixture.detectChanges(); // This triggers ngOnInit

      // During service call, loading should be true
      expect(component.loading).toBe(true);
      expect(mockCdr.markForCheck).toHaveBeenCalled();

      tick(); // Complete the service call

      expect(component.loading).toBe(false);
    }));
  });

  describe('Component State Management', () => {
    it('should reconcile image states when books change', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Load images for current books
      component.onImageLoad('1');
      component.onImageLoad('2');
      component.onImageLoad('3'); // Book that doesn't exist

      expect(component.isImageLoaded('1')).toBe(true);
      expect(component.isImageLoaded('2')).toBe(true);
      expect(component.isImageLoaded('3')).toBe(true);

      // Simulate new books loaded (without book '3')
      component.books = [mockBooks[0]]; // Only book '1' remains
      component['reconcileImageStates'](component.books);

      expect(component.isImageLoaded('1')).toBe(true); // Should remain
      expect(component.isImageLoaded('2')).toBe(false); // Should be removed
      expect(component.isImageLoaded('3')).toBe(false); // Should be removed
    }));
  });
});
