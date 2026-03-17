import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <h1>Dashboard</h1>
    <p>Dobrodošao, {{ authService.currentUser()?.name }}!</p>
    <button (click)="logout()">Odjava</button>
  `,
})
export class DashboardComponent {
  private router = inject(Router);
  public authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
