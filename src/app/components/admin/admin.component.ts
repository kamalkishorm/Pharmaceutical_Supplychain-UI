import { Component, OnInit, ViewChild, } from '@angular/core';
import { EthcontractService } from '../../ethcontract.service';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { FormBuilder, Validators, FormControl, NgSelectOption } from '@angular/forms';

import { UserTable } from './usertable';
import { async } from '@angular/core/testing';
import * as $ from 'jquery';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  account = "0x0000000000000000000000000000000000000000";
  balance = '0 ETH';
  amount = 0;
  role: 0;
  contractAddress: "0x0000000000000000000000000000000000000000";
  userCount = -1;
  closeResult: any;
  registerUser = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(16)]],
    ethaddress: ['', Validators.required],
    rrole: ['0'],
    location: this.fb.group({
      latitude: [''],
      longitude: ['']
    })
  });

  Roles = [
    { role: "NoRole", value: 0 },
    { role: "Supplier", value: 1 },
    { role: "Transporter", value: 2 },
    { role: "Manufacturer", value: 3 },
    { role: "Wholesaler", value: 4 },
    { role: "Distributer", value: 5 },
    { role: "Pharma", value: 6 }
  ];
  user_list = [];//:UserTable[];
  displayedColumns: string[] = ['ethaddress', 'location', 'name', 'role'];

  dataSource: MatTableDataSource<UserTable>;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(
    private modalService: NgbModal,
    private router: Router,
    private ethcontractService: EthcontractService,
    private fb: FormBuilder
  ) {
    localStorage.setItem('useridpointer', 0 + '');
    this.initAndDisplayAccount();
    // this.testcount();
  }
  ngOnInit() {
  }

  initAndDisplayAccount = () => {
    let that = this;
    this.ethcontractService.getOwner().then(function (acctInfo: any) {
      if (acctInfo.Role == 'Success') {
        that.account = acctInfo.Account;
        that.balance = acctInfo.Balance;
        that.contractAddress = acctInfo.contractAddress;
        that.userCount = acctInfo.UserCount;
        that.getUserInfo();
      } else {
        that.router.navigate(['/']);
      }
      console.log(acctInfo)
    }).catch(function (error) {
      console.log(error);
      that.router.navigate(['/']);

    });
  }

  getUserInfo = async () => {
    let that = this;
    console.log(that.userCount)
    // that.user_list = [];
    let itrate = true;
    let from = Number(localStorage.getItem('useridpointer'));
    let to: Number;
    if (that.userCount < from + 5) {
      to = that.userCount;
      localStorage.setItem('useridpointer', to + '');
      itrate = false;
    } else if (that.userCount > from + 5) {
      to = from + 5;
      localStorage.setItem('useridpointer', to + '');
    }
    let i: number;
    for (i = from; i < to; i++) {
      let formdata = {
        Index:i
      }
      await this.ethcontractService.getUserProfile(formdata).then(function (userInfoList: any) {
        if (userInfoList) {
          userInfoList.result.Role = that.Roles[userInfoList.result.Role].role;
          that.user_list.push(userInfoList.result);
        }
      }).catch(function (error) {
        console.log(error);
      });
    }

    console.log(that.user_list);
    this.dataSource = new MatTableDataSource<UserTable>(that.user_list);
    this.dataSource.paginator = this.paginator;
    if (itrate) {
      that.getUserInfo();
    }
  }

  refreshList = () => {
    let that = this;
    this.ethcontractService.getUserCount().then(function (count: any) {
      if (count) {
        that.userCount = count.UserCount;
        console.log(Number(localStorage.getItem('useridpointer')));
        if (Number(localStorage.getItem('useridpointer')) <= that.userCount) {
          that.getUserInfo();
        }
      }
    });

  }

  userRegister = async () => {
    console.log(this.registerUser.value);
    var formdata = {
      EthAddress: this.registerUser.value.ethaddress,
      Name: this.registerUser.value.name,
      Location: this.registerUser.value.location.latitude + "_" + this.registerUser.value.location.longitude,
      Role: this.registerUser.value.rrole
    }
    console.log(formdata);
    let that = this;
    this.ethcontractService.registerNewUser(formdata).then(function (txhash: any) {
      if (txhash) {
        console.log(txhash);
        that.handleTransactionResponse(txhash);
      }
    }).catch(function (error) {
      console.log(error);
    });
  }

  handleTransactionResponse = (txHash) => {
    var txLink = "https://ropsten.etherscan.io/tx/" + txHash;
    var txLinkHref = "<a target='_blank' href='" + txLink + "'> Click here for Transaction Status </a>";

    Swal.fire("Success", "Please Check Transaction Status here :  " + txLinkHref, "success");
    $("#linkOngoingTransaction").html(txLinkHref);
    $("#divOngoingTransaction").fadeIn();
    /*scroll to top*/
    $('html, body').animate({ scrollTop: 0 }, 'slow', function () { });
  }
}
