import { Component, OnInit } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, NavController, MenuController, ModalController, Platform } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { LensFacing, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';



import html2canvas from 'html2canvas';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  
  segment ='scan';
  // Propiedades necesarias para usuario y escaneo
  username: string = '';
  userEmail: string = '';
  userProfileImageUrl: string = 'assets/profile-placeholder.png';
  scanActive = false;
  isLoggedIn = false;
  map!: GoogleMap;
  showMap = false;
  apiKey = 'AIzaSyAQhl0p3l4El8LXw0CtrOb54-h2xZjcQao'; 
  scanResult = '';
  reservas: any[] = [];
  qrData: string = '';
  

  constructor(
    private alertController: AlertController,
    private navCtrl: NavController,
    private menu: MenuController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private plataform: Platform,
    private router: Router,

  ) {}

  ngOnInit():void {
    if(this.plataform.is('capacitor')){
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }
    this.cargarReservas(); // Cargar las reservas al iniciar

  
  }



  cargarReservas() {
    this.firestore
      .collection('reservas')
      .valueChanges()
      .subscribe(
        (reservas) => {
          this.reservas = reservas;

          if (this.reservas.length > 0) {
            // Tomar la primera reserva como ejemplo para el QR
            const reserva = this.reservas[0];
            this.qrData = JSON.stringify({
              asignatura: reserva.asignatura || '',
              sala: reserva.sala || '',
              profesor: reserva.profesor || '',
              fecha: reserva.fecha || '',
              horaInicio: reserva.horaInicio || '',
              horaFin: reserva.horaFin || '',
            });
          } else {
            this.qrData = ''; // Si no hay reservas, el QR será vacío
          }
        },
        (error) => {
          console.error('Error al cargar las reservas:', error);
        }
      );
  }

  // Escanear código QR
  async startScan() {
    const modal = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: [],
        LensFacing: LensFacing.Back,
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.scanResult = data?.barcode?.displayValue;

      try {
        if (!this.scanResult) {
          throw new Error('El QR no contiene datos.');
        }

        const reserva = JSON.parse(this.scanResult);

        // Validar que los campos requeridos estén presentes
        if (
          reserva.asignatura &&
          reserva.sala &&
          reserva.profesor &&
          reserva.fecha &&
          reserva.horaInicio &&
          reserva.horaFin
        ) {
          await this.mostrarAgendaDelDia(reserva);
        } else {
          throw new Error('El QR no contiene todos los datos necesarios.');
        }
      } catch (error) {
        console.error('Error al procesar el QR:', error);
        this.showAlert('Error', 'El código QR no contiene datos válidos o está corrupto.');
      }
    }
  }

  // Mostrar los datos de la agenda en una ventana emergente
  async mostrarAgendaDelDia(reserva: any) {
    const alert = await this.alertController.create({
      header: 'Agenda del Día',
      message: `
      
        Asignatura: ${reserva.asignatura}
        Sala:${reserva.sala}
        Profesor${reserva.profesor}
        Fecha:${reserva.fecha}
        Hora Inicio: ${new Date(reserva.horaInicio).toLocaleTimeString()}
        Hora Fin: ${new Date(reserva.horaFin).toLocaleTimeString()}
  
      `,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }








  // Abre un cuadro de diálogo para obtener permiso y muestra el mapa
  async onGpsClick() {
    const alert = await this.alertController.create({
      header: 'Ubicación',
      message: '¿Quieres ver tu ubicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: async () => {
            this.showMap = true;
            await this.initializeMapWithDelay();
          },
        },
      ],
    });
    await alert.present();
  }

  async initializeMapWithDelay() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await this.loadMap();
    await this.centerMapOnUserLocation();
  }

  async loadMap() {
    this.map = await GoogleMap.create({
      id: 'map',
      apiKey: this.apiKey,
      element: document.getElementById('map')!,
      config: {
        center: {
          lat: -33.4489, // Cambia esto por la latitud deseada
          lng: -70.6693, // Cambia esto por la longitud deseada
        },
        zoom: 15,
      },
    });
  }

  async centerMapOnUserLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      if (this.map) {
        await this.map.setCamera({
          coordinate: { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude },
          zoom: 14,
          animate: true,
        });
      }
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  }

  closeMap() {
    this.map.destroy();
    this.showMap = false;
  }
  
  async showMapModal() {
    this.showMap = true;
    setTimeout(() => this.loadMap(), 300);
  }


}

