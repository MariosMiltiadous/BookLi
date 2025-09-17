// src/app/features/library/components/book-detail/book-detail.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { IBookService } from '../../../../core/services/book.service.interface';
import { NotificationsService } from '../../../../core/utils/notifications.service';
import { IBook } from '../../../../core/models/book.interface';

import { MAT_FORM_IMPORTS } from '../../../../shared/material/material.imports';
import { finalize } from 'rxjs';

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
  private cdr = inject(ChangeDetectorRef);

  isEdit = false;
  saving = false;
  currentId: string | null = null;

  currentYear = new Date().getFullYear();

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    year: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(1450), Validators.max(new Date().getFullYear() + 1)],
    ],
    genre: ['', Validators.required],
    description: [''],
    imageUrl: [''],
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
          imageUrl: book.imageUrl,
          description: book.description,
        });
      } else {
        // create mode: reset sensible defaults
        this.form.reset({
          title: '',
          author: '',
          year: new Date().getFullYear(),
          genre: '',
          imageUrl: '',
          description: '',
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving = true;

    // Choose operation based on mode
    const operation =
      this.isEdit && this.currentId
        ? this.service.update(this.currentId, value)
        : this.service.create(value);

    // Single subscription with proper cleanup
    operation
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck(); // Trigger change detection for OnPush
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          const message = this.isEdit ? 'Book updated' : 'Book created';
          this.notify.success(message);
          this.router.navigate(['/library/books']);
        },
        error: (e) => {
          const message = this.isEdit
            ? e?.message ?? 'Update failed'
            : e?.message ?? 'Create failed';
          this.notify.error(message);
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/library/books']);
  }
}
