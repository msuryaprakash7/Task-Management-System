import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-task-details-dialog',
  templateUrl: './task-details-dialog.component.html',
  styleUrls: ['./task-details-dialog.component.scss']
})
export class TaskDetailsDialogComponent {
  task: { title: string; description: string; createdAt?: Date; };

  constructor(
    public dialogRef: MatDialogRef<TaskDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.task = data.task;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
