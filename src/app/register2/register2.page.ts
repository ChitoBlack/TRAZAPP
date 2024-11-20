import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { VirtualCardService } from 'src/services/virtual-service.service';
import { finalize } from 'rxjs/operators';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-register2',
  templateUrl: './register2.page.html',
  styleUrls: ['./register2.page.scss'],
})
export class Register2Page implements OnInit {
  registerForm: FormGroup;
  institutes = ['Universidad de Chile', 'Pontificia Universidad Católica', 'Universidad de Santiago', 'DuocUC'];
  studyPrograms = ['Ingeniería', 'Medicina', 'Derecho', 'Arquitectura', 'Psicología', 'Diseño'];
  profileImageUrl: string = 'assets/profile-placeholder.png'; // Placeholder por defecto

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private router: Router,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private virtualCardService: VirtualCardService
  ) {
    this.registerForm = this.formBuilder.group({
      birthdate: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(9)]],
      institute: ['', Validators.required],
      studyProgram: ['', Validators.required],
      additionalInfo: ['']
    });
  }

  ngOnInit() {
    const state = history.state;
    if (state && state.image) {
      // URL de la imagen recibida desde RegisterPage
      this.profileImageUrl = state.image;
    }
  }
  goBack() {
    this.navCtrl.back();
  }

  async completeRegistration() {
    const { birthdate, phone, institute, studyProgram, additionalInfo } = this.registerForm.value;

    if (this.registerForm.valid) {
      try {
        const state = history.state;
        const email = state.email;
        const username = state.username;
        const password = state.password;

        // Crear usuario en Firebase Auth
        const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user?.uid;

        if (!uid) throw new Error("No se pudo obtener el UID del usuario.");

        // Guardar la información completa en Firestore
        await this.firestore.collection('users').doc(uid).set({
          username,
          email,
          profileImageUrl: this.profileImageUrl,
          birthdate,
          phone,
          institute,
          studyProgram,
          additionalInfo,
          createdAt: new Date()
        });

        // Verificar y crear la tarjeta virtual si no existe
        const cardRef = this.firestore.collection('virtualCards').doc(uid);
        const cardDoc = await cardRef.get().toPromise();

        if (!cardDoc?.exists) {
          await this.virtualCardService.createVirtualCard();
          console.log('Tarjeta de crédito virtual creada con éxito.');
        } else {
          console.log('El usuario ya tiene una tarjeta de crédito virtual.');
        }

        // Navegar a la página de inicio después del registro
        this.router.navigateByUrl('/home');

      } catch (error) {
        console.error('Error en el registro:', error);
      }
    }
  }
}
