// src/app/features/library/components/book-detail/book-detail.component.ts
import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { IBookService } from '../../../../core/services/book.service.contract';
import { NotificationsService } from '../../../../core/utils/notifications.service';

import { MAT_FORM_IMPORTS } from '../../../../shared/material/material.imports';

@Component({
  standalone: true,
  selector: 'app-book-detail',
  imports: [CommonModule, ReactiveFormsModule, ...MAT_FORM_IMPORTS],//Angular will flatten nested arrays in imports
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetail implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject<IBookService>(BOOK_SERVICE as any);
  private notify = inject(NotificationsService);

  isEdit = false;
  currentId: string | null = null;

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.min(0)]],
    genre: ['', Validators.required],
  });

  ngOnInit(): void {
    const data = this.route.snapshot.data['book'];
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.currentId = id;
    if (data) this.form.patchValue(data);
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
