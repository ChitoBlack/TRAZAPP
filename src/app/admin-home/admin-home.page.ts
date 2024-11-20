import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController, AlertController, Platform } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { LensFacing, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage implements OnInit {
  segment: string = 'scan'; // Inicializamos la propiedad segment con un valor por defecto
  qrValue: string = ''; // Valor único para generar el QR
  mostrarModal: boolean = false;
  historial: any[] = [];
  minutos: number = 0;
  segundos: number = 0;
  interval: any;
  cronometroActivo: boolean = false;
  startTime: Date | null = null;
  endTime: Date | null = null;
  area: string = ''; // Campo para almacenar el área del profesor
  scanResult: string = ''; // Resultado del escaneo
  estadoClase: 'entrada' | 'salida' | null = null; // Estado actual de la clase

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private plataform: Platform,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.cargarArea();
    this.cargarHistorial();
    this.generarQrValue(); // Asegúrate de generar el QR al inicializar la página

    if (this.plataform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }
  }

  generarQrValue(): void {
    this.qrValue = 'Clase-LPC11' + Math.random().toString(36).substr(2, 9); // Genera un valor único
  }

  // Cargar el área del administrador desde Firestore
  async cargarArea() {
    try {
      const user = await this.afAuth.currentUser;

      if (user) {
        const adminDoc = await this.firestore.collection('admin').doc('role').get().toPromise();

        if (adminDoc?.exists) {
          const adminData = adminDoc.data() as any;
          this.area = adminData?.area || 'Área no especificada';
        } else {
          console.error('El documento del administrador no existe.');
          this.area = 'Área no especificada';
        }
      } else {
        console.error('No hay un usuario autenticado.');
        this.area = 'Usuario no autenticado';
      }
    } catch (error) {
      console.error('Error al cargar el área del administrador:', error);
      this.area = 'Error al obtener el área';
    }
  }

  // Escanear código QR para entrada o salida
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

    if (data?.barcode?.displayValue) {
      this.scanResult = data.barcode.displayValue;

      // Procesar el QR según el estado actual
      if (this.estadoClase === null || this.estadoClase === 'salida') {
        this.registrarEntrada();
      } else if (this.estadoClase === 'entrada') {
        this.registrarSalida();
      }
    }
  }

  // Registrar entrada e iniciar el cronómetro
  async registrarEntrada() {
    const now = new Date();
    this.startTime = now;
    this.estadoClase = 'entrada'; // Cambiar el estado a entrada
    this.iniciarCronometro();

    try {
      await this.firestore.collection('cronometroHistorial').add({
        tipo: 'Entrada',
        fecha: now.toLocaleDateString(),
        horaEntrada: now.toLocaleTimeString(),
        area: this.area,
      });
      this.showAlert('Entrada registrada', 'Se registró la entrada correctamente y el cronómetro ha comenzado.');
    } catch (error) {
      console.error('Error al registrar la entrada:', error);
      this.showAlert('Error', 'Hubo un problema al registrar la entrada.');
    }
  }

  // Registrar salida, pausar y reiniciar el cronómetro
  async registrarSalida() {
    const now = new Date();
    this.endTime = now;
    this.estadoClase = 'salida'; // Cambiar el estado a salida

    try {
      const totalTiempo = this.totalTiempo(this.startTime!, this.endTime);
      await this.firestore.collection('cronometroHistorial').add({
        tipo: 'Salida',
        fecha: now.toLocaleDateString(),
        horaSalida: now.toLocaleTimeString(),
        totalTiempo: totalTiempo,
        area: this.area,
      });
      this.pausarCronometro();
      this.showAlert('Salida registrada', 'Se registró la salida correctamente. El cronómetro se ha detenido y reiniciado.');
    } catch (error) {
      console.error('Error al registrar la salida:', error);
      this.showAlert('Error', 'Hubo un problema al registrar la salida.');
    }
  }

  // Mostrar alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Iniciar el cronómetro
  iniciarCronometro() {
    if (!this.cronometroActivo) {
      this.cronometroActivo = true;
      this.interval = setInterval(() => {
        this.segundos++;
        if (this.segundos === 60) {
          this.segundos = 0;
          this.minutos++;
        }
      }, 1000);
    }
  }

  // Pausar el cronómetro y reiniciar
  pausarCronometro() {
    if (this.cronometroActivo) {
      this.cronometroActivo = false;
      clearInterval(this.interval);
      this.reiniciarCronometro();
    }
  }

  // Reiniciar los valores del cronómetro
  reiniciarCronometro() {
    this.minutos = 0;
    this.segundos = 0;
  }

  // Calcular el tiempo total en formato hh:mm:ss
  totalTiempo(inicio: Date, fin: Date): string {
    const diferencia = fin.getTime() - inicio.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
    return `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}`;
  }

  // Función para rellenar con ceros
  private pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  // Cargar historial desde Firebase
  cargarHistorial() {
    this.firestore.collection('cronometroHistorial').snapshotChanges().subscribe((data) => {
      this.historial = data.map((e) => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as any,
        };
      });
    });
  }

  abrirHistorial() {
    this.mostrarModal = true;
  }

  cerrarHistorial() {
    this.mostrarModal = false;
  }

  async eliminarRegistro(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.firestore.collection('cronometroHistorial').doc(id).delete();
            this.showAlert('Registro eliminado', 'El registro ha sido eliminado correctamente.');
          },
        },
      ],
    });

    await alert.present();
  }
}
