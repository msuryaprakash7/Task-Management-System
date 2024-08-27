import { Component, Inject } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent {
  task = { title: '', description: '' };

  // constructor(
  //   public dialogRef: MatDialogRef<TaskDialogComponent>,
  //   @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean; task?: any }
  // ) {
  //   if (data.isEdit && data.task) {
  //     this.task = { ...data.task };
  //   }
  // }

  // onSave(): void {
  //   this.dialogRef.close(this.task);
  // }

  // onCancel(): void {
  //   this.dialogRef.close();
  // }
}
