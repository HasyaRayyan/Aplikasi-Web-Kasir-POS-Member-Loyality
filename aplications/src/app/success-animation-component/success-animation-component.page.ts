import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import lottie from 'lottie-web-light';

@Component({
  selector: 'app-success-animation-component',
  templateUrl: './success-animation-component.page.html',
  styleUrls: ['./success-animation-component.page.scss'],
  standalone: false
})
export class SuccessAnimationComponentPage implements AfterViewInit {
  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef;

  constructor(private modalController: ModalController) {}

  ngAfterViewInit() {
    lottie.loadAnimation({
      container : this.lottieContainer.nativeElement,
      renderer  : 'svg',
      loop      : false,
      autoplay  : true,
      path      : 'assets/animations/success-animation.json',
    });
  }

  close() {
    this.modalController.dismiss();
  }
}