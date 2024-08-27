import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Task } from './task.model';
// import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  currentTask: any = {};
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  // constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    // Sample data
    const tasks: Task[] = [
      {
        _id: '1',
        title: 'Task 1',
        description: 'Description for task 1',
        createdAt: new Date('2024-08-26T12:34:56Z'),
        type: 'todo',
      },
      {
        _id: '2',
        title: 'Task 2',
        description: 'Description for task 2',
        createdAt: new Date('2024-08-26T13:45:56Z'),
        type: 'in progress',
      },
      {
        _id: '3',
        title: 'Task 3',
        description: 'Description for task 3',
        createdAt: new Date('2024-08-26T14:56:56Z'),
        type: 'done',
      },
    ];

    // Split tasks into different arrays based on type
    this.todoTasks = tasks.filter((t) => t.type === 'todo');
    this.inProgressTasks = tasks.filter((t) => t.type === 'in progress');
    this.doneTasks = tasks.filter((t) => t.type === 'done');
  }

  onDragStart(task: Task) {
    this.currentTask = task;
  }

  onDrop(event: any, newType: string): void {
    event.preventDefault();

    if (!this.currentTask) {
      console.error('No task currently being dragged');
      return;
    }

    const previousType = this.currentTask.type; // Use the type stored in currentTask

    // Ensure the task type is different
    if (previousType === newType) {
      return;
    }

    // Remove the task from the previous list
    this.removeTaskFromList(previousType, this.currentTask._id);

    // Update the task type and add it to the new list
    this.currentTask.type = newType;
    this.addTaskToList(newType, this.currentTask);

    // Handle the task move
    this.handleTaskMoved(this.currentTask, newType);

    // Reset the current task
    this.currentTask = {};
  }

  onDragOver($event: any) {
    $event.preventDefault();
  }

  removeTaskFromList(type: string, id: string): void {
    if (type === 'todo') {
      this.todoTasks = this.todoTasks.filter((t) => t._id !== id);
    } else if (type === 'in progress') {
      this.inProgressTasks = this.inProgressTasks.filter((t) => t._id !== id);
    } else if (type === 'done') {
      this.doneTasks = this.doneTasks.filter((t) => t._id !== id);
    }
  }

  addTaskToList(type: string, task: Task): void {
    if (type === 'todo') {
      this.todoTasks.push(task);
    } else if (type === 'in progress') {
      this.inProgressTasks.push(task);
    } else if (type === 'done') {
      this.doneTasks.push(task);
    }
  }

  handleTaskMoved(task: Task, newType: string): void {
    console.log(`Task ${task.title} moved to ${newType}`);
  }

  deleteTask(task: any) {
    console.log(`Deleting task ${task.title}`);
    // Implement deletion logic here
  }

  editTask(task: any) {
    console.log(`Editing task ${task.title}`);
    // Implement editing logic here
  }

  viewDetails(task: any) {
    console.log(`Viewing details for task ${task.title}`);
    // Implement view details logic here
  }

  openTaskDialog(task?: Task): void {
    const isEdit = !!task;
    // const dialogRef = this.dialog.open(TaskDialogComponent, {
    //   width: '400px',
    //   data: { isEdit, task },
    // });

    // dialogRef.afterClosed().subscribe((result: Task) => {
    //   if (result) {
    //     if (isEdit) {
    //       // Update task
    //       this.updateTask(result);
    //     } else {
    //       // Add new task
    //       result._id = new Date().toISOString(); // Generate a unique ID for new task
    //       result.type = 'todo'; // Default to 'todo'
    //       this.addTaskToList('todo', result);
    //     }
    //   }
    // });
  }

  updateTask(updatedTask: Task): void {
    const index = this.findTaskIndexById(updatedTask._id);
    if (index !== -1) {
      const list = this.getTaskListByType(updatedTask.type);
      list[index] = updatedTask;
    }
  }

  findTaskIndexById(id: string): number {
    return [...this.todoTasks, ...this.inProgressTasks, ...this.doneTasks].findIndex(task => task._id === id);
  }

  getTaskListByType(type: string): Task[] {
    if (type === 'todo') return this.todoTasks;
    if (type === 'in progress') return this.inProgressTasks;
    if (type === 'done') return this.doneTasks;
    return [];
  }
}
