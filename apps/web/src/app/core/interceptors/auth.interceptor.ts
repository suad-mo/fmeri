import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Dodaj token na svaki request ako postoji
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ako dobijemo 401 — pokušaj refresh
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authService.refresh().pipe(
          switchMap((response) => {
            // Ponovi originalni request s novim tokenom
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.token}` },
            });
            return next(retryReq);
          }),
          catchError(() => {
            // Refresh nije uspio — logout
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
