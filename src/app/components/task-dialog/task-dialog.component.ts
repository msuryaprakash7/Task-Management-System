import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss'],
})
export class TaskDialogComponent {
  task: any = {};

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.isEdit) {
      this.task = { ...data.task };
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
     // Check if the createdAt property is already present
     if (!this.task.createdAt) {
      // Add the current date and time to the task's createdAt field only if it's not already set
      this.task.createdAt = new Date();
    }

    // Close the dialog and pass the updated task object
    this.dialogRef.close(this.task);
  }
}
