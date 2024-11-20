import { Component } from '@angular/core';
import { NavController, MenuController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isLoggedIn = false; // Estado de sesión
  isAdmin = false; // Determina si el usuario es administrador

  constructor(
    private navCtrl: NavController,
    private menu: MenuController,
    private afAuth: AngularFireAuth,
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService
  ) {
    // Cerrar sesión automáticamente al cargar la aplicación
    this.cerrarSesionAlInicio();

    // Escuchar cambios en el estado de autenticación
    this.afAuth.authState.subscribe(async (user) => {
      this.isLoggedIn = !!user;
      if (user) {
        // Verificar el rol del usuario
        await this.checkUserRole();
      } else {
        this.isAdmin = false;
      }
    });
  }

  // Cerrar sesión al iniciar la aplicación
  async cerrarSesionAlInicio() {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/login']); // Redirigir al login
    } catch (error) {
      console.error('Error al cerrar sesión automáticamente:', error);
    }
  }

  // Verificar el rol del usuario
  async checkUserRole() {
    try {
      this.isAdmin = await this.authService.isAdmin(); // Verificar si es administrador
    } catch (error) {
      console.error('Error al verificar el rol del usuario:', error);
      this.isAdmin = false;
    }
  }

  // Navegar a las páginas según el rol y la opción seleccionada
  async navigateTo(page: string) {
    this.menu.close();

    if (page === 'salas') {
      // Manejar la navegación para "Salas"
      await this.checkUserRole(); // Verificar el rol antes de navegar

      if (this.isAdmin) {
        this.navCtrl.navigateForward('/salas'); // Página para administrar reservas
      } else {
        this.navCtrl.navigateForward('/salas-disponibles'); // Página solo para ver salas disponibles
      }
    } else if (page === 'perfil') {
      // Manejar la navegación para "Perfil"
      await this.checkUserRole();

      if (this.isAdmin) {
        this.navCtrl.navigateForward('/admin-profile'); // Perfil del administrador
      } else {
        this.navCtrl.navigateForward('/perfil'); // Perfil del usuario
      }
    } else {
      // Navegación para otras páginas
      this.navCtrl.navigateForward(`/${page}`);
    }
  }

  // Manejar el inicio o cierre de sesión
  async loginOrLogout() {
    if (!this.isLoggedIn) {
      this.router.navigateByUrl('/login'); // Redirigir al login
    } else {
      await this.logout();
    }
  }

  // Cerrar sesión
  async logout() {
    try {
      await this.afAuth.signOut();
      this.showAlert('Cerrar Sesión', 'Has cerrado sesión con éxito.');
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.router.navigateByUrl('/login'); // Redirigir al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Mostrar una alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
