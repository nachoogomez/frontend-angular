import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePageComponent implements OnInit {
  userName: string = '';
  isLoading: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    // Get user name from auth service
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = userData.fullName || userData.email || 'User';
      this.isAdmin = userData.role === 'ADMIN';
    } else {
      this.userName = 'User';
      this.isAdmin = false;
    }
  }

  onLogout(): void {
    this.isLoading = true;
    
    // Use auth service to logout
    this.authService.logout();
    
    // Redirect to login
    setTimeout(() => {
      this.router.navigate(['/auth']);
      this.isLoading = false;
    }, 1000);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/users/profile']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin/users']);
  }
}
