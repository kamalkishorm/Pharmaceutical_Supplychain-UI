import { Component } from '@angular/core';
import { EthcontractService } from '../../ethcontract.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent {

  account = "0x0";
  balance = '0 ETH';
  amount = 0;
  role:any;

  constructor(
    private router: Router,
    private ethcontractService: EthcontractService
    ) {
    this.initAndDisplayAccount();
  }
  initAndDisplayAccount = () => {
    let that = this;
    this.ethcontractService.getRole().then(function (acctInfo:any) {
      that.account = acctInfo.Account;
      that.balance = acctInfo.Balance;
      that.role = JSON.stringify(acctInfo.Role,null, '\t');
      console.log(that.role);
      // window.acc = that.role;
      console.log(acctInfo)
      if(acctInfo.Role.Role != 1){
        window.alert("User is not Supplier.")
        that.router.navigate(['/']);
      }
    }).catch(function (error) {
      console.log(error);
      that.router.navigate(['/']);

    });
  }

}
