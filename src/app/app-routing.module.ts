import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component'
import { UserComponent } from './components/user/user.component'
import { SupplierComponent } from './components/supplier/supplier.component'


const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Home Page' }
  },
  {
    path: 'user',
    component: UserComponent,
    data: { title: 'User Page' }
  },
  {
    path: 'supplier',
    component: SupplierComponent,
    data: { title: 'User Page' }
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Admin Page' }
  },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: '**', redirectTo: '/home' }

  // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
