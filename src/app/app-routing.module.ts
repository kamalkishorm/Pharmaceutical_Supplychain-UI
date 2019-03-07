import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component'
import { UserComponent } from './components/user/user.component'
import { SupplierComponent } from './components/supplier/supplier.component'
import { ManufacturerComponent } from './components/manufacturer/manufacturer.component'
import { TransporterComponent } from './components/transporter/transporter.component'
import { TestComponent } from './components/testcomponents/testcomponent.component'



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
    data: { title: 'Supplier Page' }
  },
  {
    path: 'manufacturer',
    component: ManufacturerComponent,
    data: { title: 'Manufacturer Page' }
  },
  {
    path: 'transporter',
    component: TransporterComponent,
    data: { title: 'Transporter Page' }
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Admin Page' }
  },
  {
    path: 'test',
    component: TestComponent,
    data: { title: 'Test Page' }
  },
  {
    path: '',
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
