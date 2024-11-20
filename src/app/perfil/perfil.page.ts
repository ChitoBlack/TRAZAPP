import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

interface UserData {
  profileImageUrl?: string;
  username?: string;
  email?: string;
  birthdate?: string;
  phone?: string;
  institute?: string;
  studyProgram?: string;
  additionalInfo?: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  isLoggedIn = false;
  userData: UserData = {};
  profileimageUrl: string = 'assets/profile-placeholder.png'; // Imagen predeterminada

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  // Verificar el estado de autenticación del usuario
  checkAuthStatus() {
    this.afAuth.authState.subscribe((user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.loadUserData(user.uid);
      } else {
        this.profileimageUrl = 'assets/profile-placeholder.png';
      }
    });
  }

  // Cargar datos del usuario desde Firestore
  async loadUserData(uid: string) {
    const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();
    const userData = userDoc?.data() as UserData | undefined;

    if (userData) {
      this.userData = userData; // Almacenar todos los datos en userData
      this.profileimageUrl = userData.profileImageUrl || 'assets/profile-placeholder.png';
    } else {
      this.profileimageUrl = 'assets/profile-placeholder.png';
    }
  }
}
