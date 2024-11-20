import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { VirtualCardService } from 'src/services/virtual-service.service';
import { AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  profileimageUrl: string = 'assets/profile-placeholder.png'; // Imagen predeterminada
  registerForm: FormGroup;

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private router: Router,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private virtualCardService: VirtualCardService
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // Método para tomar una foto y subirla a Firebase Storage
  async captureAndUploadPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
  
      if (!image.base64String) throw new Error("No se pudo obtener la imagen en formato Base64.");
  
      const filePath = `photos/${new Date().getTime()}_photo.png`;
      const fileRef = this.storage.ref(filePath);
      
      const uploadTask = fileRef.putString(image.base64String, 'base64');
  
      await new Promise<void>((resolve, reject) => {
        uploadTask.snapshotChanges().pipe(
          finalize(async () => {
            try {
              this.profileimageUrl = await fileRef.getDownloadURL().toPromise();
              this.showAlert('Foto subida', 'Tu foto ha sido capturada y subida con éxito.');
              resolve();
            } catch (error) {
              console.error('Error al obtener la URL de descarga:', error);
              this.showAlert('Error', 'No se pudo obtener la URL de la foto.');
              reject(error);
            }
          })
        ).subscribe();
      });
    } catch (error) {
      console.error('Error al tomar o subir la foto:', error);
      this.showAlert('Error', 'Hubo un problema al tomar o subir la foto. Intenta de nuevo.');
    }
  }
  
  
  // Navegar a la segunda página de registro
  async goToRegisterPage2() {
    if (this.registerForm.valid && this.profileimageUrl) { // Asegurarse de que la foto se haya cargado
      const { username, email, password } = this.registerForm.value;

      // Navegar a la segunda página de registro con la URL de la foto
      await this.router.navigate(['/register2'], {
        state: {
          username,
          email,
          password,
          image: this.profileimageUrl
        }
      });
    } else {
      this.showAlert('Error', 'Completa todos los campos y asegúrate de que la foto esté subida.');
    }
  }

  // Mostrar una alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Obtener mensajes de error para los campos del formulario
  getUsernameError(): string {
    const usernameControl = this.registerForm.get('username');
    if (usernameControl?.hasError('required')) return 'El nombre de usuario es obligatorio.';
    if (usernameControl?.hasError('minlength')) return 'Debe tener al menos 3 caracteres.';
    return '';
  }

  getEmailError(): string {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.hasError('required')) return 'El correo es obligatorio.';
    if (emailControl?.hasError('email')) return 'El formato del correo es inválido.';
    if (emailControl?.hasError('pattern')) return 'El correo debe terminar en @gmail.com.';
    return '';
  }

  getPasswordError(): string {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.hasError('required')) return 'La contraseña es obligatoria.';
    if (passwordControl?.hasError('minlength')) return 'Debe tener al menos 8 caracteres.';
    return '';
  }

  goBack() {
    this.navCtrl.back();
  }
}

