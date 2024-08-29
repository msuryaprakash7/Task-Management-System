import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'; // For notifications
import { Task } from './task.model';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TaskDetailsDialogComponent } from '../task-details-dialog/task-details-dialog.component';
import { DashboardService } from 'src/app/services/dashboard.service';
import { LoaderService } from 'src/app/services/loader.service'; // Assuming you have a LoaderService

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
  tasks: Task[] = [];
  filteredTasks: Task[] = []; // Holds tasks after search and sort
  searchQuery: string = '';
  sortOption: string = '';
  constructor(
    public dialog: MatDialog,
    private dashboardService: DashboardService,
    private loaderService: LoaderService, // Inject LoaderService
    private snackBar: MatSnackBar // Inject MatSnackBar for notifications
  ) {}

  ngOnInit(): void {
    this.fetchTasks();
  }
  filterTasks(searchTerm: string = ''): void {
    this.filteredTasks = this.tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
    this.updateTaskLists();
  }

  sortTasks(sortOrder: string): void {
    switch (sortOrder) {
      case 'recent':
        this.filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        this.filteredTasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }
    this.updateTaskLists();
  }

  updateTaskLists(): void {
    this.todoTasks = this.filteredTasks.filter(task => task.type === 'todo');
    this.inProgressTasks = this.filteredTasks.filter(task => task.type === 'in progress');
    this.doneTasks = this.filteredTasks.filter(task => task.type === 'done');
  }
  fetchTasks(): void {
    this.loaderService.show(); // Show loader
    this.dashboardService.getTasks().subscribe(
      (response: { data: Task[] }) => {
        this.loaderService.hide(); // Hide loader
        this.tasks = response.data;
        this.filterTasks();
        this.todoTasks = this.tasks.filter((t) => t.type === 'todo');
        this.inProgressTasks = this.tasks.filter((t) => t.type === 'in progress');
        this.doneTasks = this.tasks.filter((t) => t.type === 'done');
        this.snackBar.open(`Task fetched successfully.`, 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      (error) => {
        this.loaderService.hide(); // Hide loader
        console.error('Error fetching tasks:', error);
        this.snackBar.open('Error fetching tasks', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    );
  }
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    this.filterTasks(searchTerm);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const sortOrder = select.value;
    this.sortTasks(sortOrder);
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

    const previousType = this.currentTask.type;
    if (previousType === newType) {
      return;
    }

    this.removeTaskFromList(previousType, this.currentTask._id);
    this.currentTask.type = newType;
    this.addTaskToList(newType, this.currentTask);

    this.handleTaskMoved(this.currentTask, newType);
    this.updateTaskOnServer(this.currentTask);
    this.currentTask = {};
  }

  updateTaskOnServer(task: Task): void {
    this.loaderService.show(); // Show loader
    this.dashboardService.updateTask(task).subscribe(
      () => {
        this.loaderService.hide(); // Hide loader
        this.snackBar.open(
          `Task ${task.title} successfully updated.`,
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          }
        );
      },
      (error) => {
        this.loaderService.hide(); // Hide loader
        console.error('Error updating task:', error);
        this.snackBar.open('Error updating task', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        this.removeTaskFromList(task.type, task._id);
        this.addTaskToList(task.type, task);
      }
    );
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

  deleteTask(task: Task) {
    this.loaderService.show(); // Show loader
    this.dashboardService.deleteTask(task._id).subscribe(
      () => {
        this.loaderService.hide(); // Hide loader
        this.removeTaskFromList(task.type, task._id);
        this.snackBar.open(`Task ${task.title} deleted.`, 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      },
      (error) => {
        this.loaderService.hide(); // Hide loader
        console.error('Error deleting task:', error);
        this.snackBar.open('Error deleting task', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    );
  }

  editTask(task: Task) {
    this.openTaskDialog(task);
  }

  viewDetails(task: Task) {
    this.dialog.open(TaskDetailsDialogComponent, {
      data: { task: task },
      width: '400px',
    });
  }

  openTaskDialog(task?: Task): void {
    const isEdit = !!task;
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: { isEdit, task },
    });

    dialogRef.afterClosed().subscribe((result: Task) => {
      if (result) {
        if (isEdit) {
          this.updateTask(result);
        } else {
          result._id = new Date().toISOString();
          result.type = 'todo';
          this.loaderService.show(); // Show loader
          this.dashboardService.addTask(result).subscribe(
            () => {
              this.loaderService.hide(); // Hide loader
              this.addTaskToList('todo', result);
              this.snackBar.open('Task added successfully.', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              });
              this.fetchTasks();
            },
            (error) => {
              this.loaderService.hide(); // Hide loader
              console.error('Error adding task:', error);
              this.snackBar.open('Error adding task', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['error-snackbar'],
              });
            }
          );
        }
      }
    });
  }

  updateTask(updatedTask: Task): void {
    const taskList = this.getTaskListByType(updatedTask.type);
    if (taskList.length === 0) {
      console.error(`No tasks found for type: ${updatedTask.type}`);
      return;
    }

    const index = taskList.findIndex((task) => task._id === updatedTask._id);
    if (index !== -1) {
      taskList[index] = updatedTask;
      this.loaderService.show(); // Show loader
      this.dashboardService.updateTask(updatedTask).subscribe(
        () => {
          this.loaderService.hide(); // Hide loader
          this.fetchTasks();
          this.snackBar.open('Task updated successfully.', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        (error) => {
          this.loaderService.hide(); // Hide loader
          console.error('Error updating task:', error);
          this.snackBar.open('Error updating task', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        }
      );
    } else {
      console.error(
        `Task with id ${updatedTask._id} not found in type: ${updatedTask.type}`
      );
    }
  }

  getTaskListByType(type: string): Task[] {
    switch (type) {
      case 'todo':
        return this.todoTasks;
      case 'in progress':
        return this.inProgressTasks;
      case 'done':
        return this.doneTasks;
      default:
        console.error(`Unknown task type: ${type}`);
        return [];
    }
  }
}
