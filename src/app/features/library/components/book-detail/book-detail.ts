// src/app/features/library/components/book-detail/book-detail.component.ts
import { Component, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { IBookService } from '../../../../core/services/book.service.interface';
import { NotificationsService } from '../../../../core/utils/notifications.service';
import { IBook } from '../../../../core/models/book.interface';

import { MAT_FORM_IMPORTS } from '../../../../shared/material/material.imports';

@Component({
  standalone: true,
  selector: 'app-book-detail',
  imports: [CommonModule, ReactiveFormsModule, ...MAT_FORM_IMPORTS],
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetail {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject<IBookService>(BOOK_SERVICE as any);
  private notify = inject(NotificationsService);
  private destroyRef = inject(DestroyRef);

  isEdit = false;
  currentId: string | null = null;

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(0)]],
    genre: ['', Validators.required],
  });

  ngOnInit(): void {
    // Subscribe so we react to resolver data on initial load AND param changes
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((d) => {
      const book = d['book'] as IBook | undefined;

      this.isEdit = !!book;
      this.currentId = book?.id ?? null;

      if (book) {
        // edit mode: patch form with resolved book
        this.form.patchValue({
          title: book.title,
          author: book.author,
          year: book.year,
          genre: book.genre,
        });
      } else {
        // create mode: reset sensible defaults
        this.form.reset({
          title: '',
          author: '',
          year: new Date().getFullYear(),
          genre: '',
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();

    if (this.isEdit && this.currentId) {
      this.service.update(this.currentId, value).subscribe({
        next: () => {
          this.notify.success('Book updated');
          this.router.navigate(['/library/books']);
        },
        error: (e) => this.notify.error(e?.message ?? 'Update failed'),
      });
    } else {
      this.service.create(value).subscribe({
        next: () => {
          this.notify.success('Book created');
          this.router.navigate(['/library/books']);
        },
        error: (e) => this.notify.error(e?.message ?? 'Create failed'),
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/library/books']);
  }
}
