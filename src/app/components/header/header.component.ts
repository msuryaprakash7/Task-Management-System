import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false; // Adjust this based on your authentication logic

  constructor(private cookieService: CookieService,
    private loginService: LoginService
  ) {}
  ngOnInit(): void {
    this.isLoggedIn =
      localStorage.getItem('isLoggedIn') === 'true' ? true : false;
  }
  logOut() {
    this.loginService.logOut();
  }
}
