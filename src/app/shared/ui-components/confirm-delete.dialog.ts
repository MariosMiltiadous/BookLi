import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteData { title: string; }

@Component({
  standalone: true,
  selector: 'app-confirm-delete-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon aria-hidden="true">warning</mat-icon>
      Confirm delete
    </h2>

    <div mat-dialog-content>
      Are you sure you want to delete the book <strong>{{ data.title }}</strong>?
    </div>

    <div mat-dialog-actions align="end">
      <button mat-stroked-button (click)="close(false)" aria-label="Cancel delete">Cancel</button>
      <button mat-flat-button color="warn" (click)="close(true)" aria-label="Confirm delete">
        <mat-icon>delete</mat-icon>&nbsp;Delete
      </button>
    </div>
  `,
})
export class ConfirmDeleteDialog {
  constructor(
    private ref: MatDialogRef<ConfirmDeleteDialog, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteData
  ) {}
  close(result: boolean) { this.ref.close(result); }
}
