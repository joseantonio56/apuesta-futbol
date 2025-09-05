import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { ApuestaComponent } from './components/apuesta/apuesta.component';
import { LoginComponent } from './components/login/login.component';
import { Auth } from './guards/auth';

const routes: Routes = [
  { path: '', redirectTo: 'apuestas', pathMatch: 'full' },
  { path: 'apuestas', component: ApuestaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [Auth] },
  { path: '**', redirectTo: 'apuestas' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
