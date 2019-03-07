import { Component } from '@angular/core';
import { Router } from '@angular/router';


import { EthcontractService } from '../../ethcontract.service';


@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserComponent {
  account = "0x0";
  balance = '0 ETH';
  amount = 0;
  role: any;

  constructor(
    private router: Router,
    private ethcontractService: EthcontractService
  ) {
    this.initAndDisplayAccount();
  }
  initAndDisplayAccount = () => {
    let that = this;
    this.ethcontractService.getRole().then(function(acctInfo: any) {
      that.account = acctInfo.Account;
      that.balance = acctInfo.Balance;
      that.role = acctInfo.Role.Role;

      console.log(acctInfo.Role);
      console.log(that.role);
      switch (that.role + "") {
        case '0':
          window.alert("User Information does not found.")
          that.router.navigate(['']);
          break;
        case '1':
          that.router.navigate(['/supplier']);
          break;
        case '2':
          that.router.navigate(['/transporter']);
          break;
        case '3':
          that.router.navigate(['/manufacturer']);
          break;
        default:
          window.alert("User information doesnot found: " + that.role)
          break;
      }
    }).catch(function(error) {
      console.log(error);
      // that.router.navigate(['/']);
    });
  }
}
