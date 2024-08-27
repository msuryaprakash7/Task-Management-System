import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isLoggedIn: boolean = false; // Adjust this based on your authentication logic

  // Toggle this flag based on user authentication status
  toggleLoginStatus(): void {
    this.isLoggedIn = !this.isLoggedIn;
  }
}
