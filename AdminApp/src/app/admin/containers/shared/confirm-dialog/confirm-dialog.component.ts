import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title || 'Xác nhận';
    this.message = data.message || 'Bạn có chắc chắn muốn thực hiện hành động này?';
    this.confirmButtonText = data.confirmButtonText || 'Xác nhận';
    this.cancelButtonText = data.cancelButtonText || 'Hủy';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
} 