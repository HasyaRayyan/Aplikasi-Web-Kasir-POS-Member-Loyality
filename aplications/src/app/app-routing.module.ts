import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'tab',
    loadChildren: () => import('./tab/tab.module').then( m => m.TabPageModule)
  },
  {
    path: 'detail',
    loadChildren: () => import('./detail/detail.module').then( m => m.DetailPageModule)
  },
  {
    path: 'keranjang',
    loadChildren: () => import('./keranjang/keranjang.module').then( m => m.KeranjangPageModule)
  },
  {
    path: 'send-chat',
    loadChildren: () => import('./send-chat/send-chat.module').then( m => m.SendChatPageModule)
  },
  {
    path: 'custom-date',
    loadChildren: () => import('./custom-date/custom-date.module').then( m => m.CustomDatePageModule)
  },
  {
    path: 'edit-pass',
    loadChildren: () => import('./edit-pass/edit-pass.module').then( m => m.EditPassPageModule)
  },
  {
    path: 'edit-membership',
    loadChildren: () => import('./edit-membership/edit-membership.module').then( m => m.EditMembershipPageModule)
  },
  {
    path: 'success-animation-component',
    loadChildren: () => import('./success-animation-component/success-animation-component.module').then( m => m.SuccessAnimationComponentPageModule)
  },
  {
    path: 'fail-animation-component',
    loadChildren: () => import('./fail-animation-component/fail-animation-component.module').then( m => m.FailAnimationComponentPageModule)
  },
  {
    path: 'forgot',
    loadChildren: () => import('./forgot/forgot.module').then( m => m.ForgotPageModule)
  },
  {
    path: 'qris-modal',
    loadChildren: () => import('./qris-modal/qris-modal.module').then( m => m.QrisModalPageModule)
  },
  {
    path: 'tes',
    loadChildren: () => import('./tes/tes.module').then( m => m.TesPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

