import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { IonicSlides } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  swiperModules = [IonicSlides];
  
  loginForm: FormGroup;

  slideImages: string[] = [
    '../../assets/img/app.png',
    '../../assets/img/qrcode.png',
    '../../assets/img/list.png'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private alertController: AlertController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      try {
        const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
        const uid = userCredential.user?.uid;

        if (uid) {
          // Verificar si el usuario está en la colección `admin`
          const adminQuery = await this.firestore.collection('admin', ref => ref.where('email', '==', email)).get().toPromise();

          if (adminQuery && !adminQuery.empty) {
            // Si el usuario está en `admin`, redirige a la página de administrador
            localStorage.setItem('userRole', 'admin');
            this.router.navigateByUrl('/admin-home');
          } else {
            // Si no está en `admin`, redirige a la página de estudiante
            localStorage.setItem('userRole', 'user');
            this.router.navigateByUrl('/home');
          }
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.showAlert('Error', 'Correo o contraseña incorrectos. Por favor, intenta de nuevo.');
      }
    } else {
      this.showAlert('Error', 'Por favor, completa todos los campos correctamente.');
    }
  }

  // Mostrar una alerta en caso de error
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}

