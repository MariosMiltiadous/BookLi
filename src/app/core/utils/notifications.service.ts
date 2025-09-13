import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class NotificationsService {
  private snack = inject(MatSnackBar);

  success(msg: string) { this.snack.open(msg, 'OK', { duration: 2500, panelClass: ['snack-success'] }); }
  error(msg: string)   { this.snack.open(msg, 'Dismiss', { duration: 3500, panelClass: ['snack-error'] }); }
  info(msg: string)    { this.snack.open(msg, 'OK', { duration: 2500 }); }
}
