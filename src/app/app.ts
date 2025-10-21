import { Component, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutService } from './core/services/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  showLayout: boolean = false;

  constructor(
    private router: Router,
    private layoutService: LayoutService
  ) {}

  ngOnInit() {
    // Subscribe to layout service changes
    this.layoutService.showLayout$.subscribe(show => {
      this.showLayout = show;
    });

    // Check initial route and set layout visibility
    const initialUrl = this.router.url;
    const isAuthRoute = initialUrl.startsWith('/auth') || initialUrl === '/';
    this.layoutService.setShowLayout(!isAuthRoute);

    // Listen to route changes to determine if layout should be shown
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide navbar and footer on auth pages
        const isAuthRoute = event.url.startsWith('/auth') || event.url === '/';
        this.layoutService.setShowLayout(!isAuthRoute);
      });
  }
}
