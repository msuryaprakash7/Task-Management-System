import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private loaderService: LoaderService) {
    this.loaderService.loaderState.subscribe((state) => {
      console.log('Loader state changed:', state);
      this.loading = state;
    });
  }

  ngOnInit(): void {
    this.loaderService.loaderSubject.subscribe((state) => {
      console.log('Loader state changed:', state);
      this.loading = state;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscription.unsubscribe();
  }
}
