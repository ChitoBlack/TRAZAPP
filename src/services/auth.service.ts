import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  async register(email: string, password: string, imageFile: File) {
    const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    const filePath = `users/${userCredential.user?.uid}/profile_image`;
    const fileRef = this.storage.ref(filePath);

    await this.storage.upload(filePath, imageFile).then(() => {
      fileRef.getDownloadURL().subscribe(async (url) => {
        await this.firestore.collection('users').doc(userCredential.user?.uid).set({
          email,
          profileImageUrl: url,
        });
        localStorage.setItem('userProfileImageUrl', url);
      });
    });
  }
  

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;
      
      // Verificar si el usuario es admin
      const adminDoc = await this.firestore.collection('admin').doc(uid).get().toPromise();
      const adminData = adminDoc?.data() as { email: string } | undefined;

      if (adminData?.email === email) {
        // Si el usuario es un administrador, guardar el rol en localStorage
        localStorage.setItem('userRole', 'admin');
        this.redirectAfterLogin('/admin-home'); // Redirigir al inicio de administrador
      } else {
        // Si es un estudiante
        const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();
        
        if (userDoc?.exists) {
          const userData = userDoc.data() as { email: string; profileImageUrl?: string };
          localStorage.setItem('userProfileImageUrl', userData.profileImageUrl || '');
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userRole', 'user');
          this.redirectAfterLogin('/home'); // Redirigir al inicio de estudiante
        } else {
          console.error('No se encontró información del usuario en Firestore');
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw new Error('Correo o contraseña incorrectos, o el usuario no existe.');
    }
  }

  getAdminProfile() {
    return this.firestore.collection('admin').doc('role').get().toPromise();
  }

  private redirectAfterLogin(path: string) {
    location.href = path;
  }

  logout() {
    localStorage.clear();
    return this.afAuth.signOut();
  }

  getCurrentUser() {
    return this.afAuth.authState;
  }

  // Verifica si el usuario es administrador basado en el rol guardado en localStorage
  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'admin';
  }
}
