import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    if (user) {
      return true; // Usuario autenticado, permite acceso
    } else {
      this.router.navigate(['/login']); // Redirige al login
      return false; // Bloquea el acceso
    }
  }
}
