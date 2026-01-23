import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import lottie from 'lottie-web-light';

@Component({
  selector: 'app-fail-animation-component',
  templateUrl: './fail-animation-component.page.html',
  styleUrls: ['./fail-animation-component.page.scss'],
  standalone: false
})
// export class FailAnimationComponentPage implements AfterViewInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }


export class FailAnimationComponentPage implements AfterViewInit {
  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef;

  constructor(private modalController: ModalController) {}

  ngAfterViewInit() {
    lottie.loadAnimation({
      container : this.lottieContainer.nativeElement,
      renderer  : 'svg',
      loop      : false,
      autoplay  : true,
      path      : 'assets/animations/Animation fail.json',
    });
  }

  close() {
    this.modalController.dismiss();
  }
}
