import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ReservarSalaComponent } from '../modals/reservar-sala/reservar-sala.component';

@Component({
  selector: 'app-salas',
  templateUrl: './salas.page.html',
  styleUrls: ['./salas.page.scss'],
})
export class SalasPage implements OnInit {
  asignatura: string = '';
  salas: any[] = []; // Las salas serán cargadas desde Firestore
  nombreProfesor: string = ''; // Nombre del profesor

  constructor(
    private firestore: AngularFirestore,
    private modalCtrl: ModalController,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.obtenerDatosProfesor();
    this.cargarSalas();
  }

  

  // Obtener el nombre del profesor desde Firestore
  async obtenerDatosProfesor() {
    try {
      const user = await this.afAuth.currentUser;

      if (user) {
        const adminDoc = await this.firestore.collection('admin').doc('role').get().toPromise();
        if (adminDoc?.exists) {
          const adminData = adminDoc.data() as any;
          this.nombreProfesor = adminData?.nombre || 'Profesor Desconocido';
          this.asignatura = adminData?.asignatura || 'Asignatura no especificada';
        } else {
          console.error('No se encontró el documento de admin.');
        }
      }
    } catch (error) {
      console.error('Error al obtener los datos del profesor:', error);
    }
  }

  

  // Cargar las salas desde Firestore
  cargarSalas() {
    this.firestore
      .collection('salas')
      .snapshotChanges()
      .subscribe(
        (data) => {
          this.salas = data.map((e) => ({
            id: e.payload.doc.id,
            ...e.payload.doc.data() as any,
          }));
        },
        (error) => {
          console.error('Error al cargar las salas:', error);
        }
      );
  }

  // Abrir el modal para reservar sala
  async reservarSala(sala: any) {
    const modal = await this.modalCtrl.create({
      component: ReservarSalaComponent,
      componentProps: {
        sala: sala.nombre,
      },
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data) {
        console.log('Reserva Confirmada:', result.data);

        try {
          // Guardar reserva en la colección 'reservas'
          await this.firestore.collection('reservas').add({
            sala: sala.nombre,
            horaInicio: result.data.horaInicio,
            horaFin: result.data.horaFin,
            fecha: new Date().toLocaleDateString(),
            profesor: this.nombreProfesor, // Guardar el nombre del profesor
            asignatura: this.asignatura, // Guardar la asignatura del profesor
          });

          // Actualizar el estado de la sala en la colección 'salas'
          const salaDocRef = this.firestore.collection('salas').doc(sala.id);
          const salaDoc = await salaDocRef.get().toPromise();

          if (salaDoc && salaDoc.exists) {
            await salaDocRef.update({
              disponible: false,
            });
            sala.disponible = false; // Actualizar el estado localmente
            alert('Reserva guardada en la base de datos.');
          } else {
            console.error(`El documento para la sala "${sala.nombre}" no existe en Firestore.`);
            alert('Error: No se pudo actualizar el estado de la sala porque no existe en la base de datos.');
          }
        } catch (error) {
          console.error('Error al guardar la reserva o actualizar la sala:', error);
          alert('Error al realizar la reserva. Inténtalo nuevamente.');
        }
      }
    });

    await modal.present();
  }
}
