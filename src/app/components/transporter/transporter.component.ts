import { Component, OnInit, ViewChild, } from '@angular/core';
import { EthcontractService } from '../../ethcontract.service';
import { Router } from '@angular/router';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { RawMaterial } from './rawmattable';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormControl, NgSelectOption } from '@angular/forms';
import { async } from 'q';
import * as $ from 'jquery';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-user-transporter',
  templateUrl: './transporter.component.html',
  styleUrls: ['./transporter.component.css']
})
export class TransporterComponent implements OnInit {

  account = "0x0";
  balance = '0 ETH';
  amount = 0;
  name: any;
  location: any;
  role: any;
  packageCount: any;
  Roles = {
    0: "NoRole",
    1: "Supplier",
    2: "Transporter",
    3: "Manufacturer",
    4: "Wholesaler",
    5: "Distributer",
    6: "Pharma",
    7: "Role Revoked"
  }
  packageStatus = {
    0: "At Creator",
    1: "Picked",
    2: "Delivered"
  }
  package_list = [];
  displayedColumns: string[] = [
    'txtype',
    'batchid',
    // 'description',
    // 'farmername',
    'location',
    'quantity',
    // 'shipper',
    'from',
    'to',
    'status',
    'star'
  ];

  packageInfo = {
    Status: 0,
    Batch: {
      Done: false
    },
    Shipper: {
      Done: false
    },
    Manufacturer: {
      Done: false
    }
  };
  packageDetails = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(16)]],
    farmername: ['', [Validators.required, Validators.maxLength(16)]],
    location: this.fb.group({
      latitude: [''],
      longitude: ['']
    }),
    quantity: [0, [Validators.required]],
    shipper: ['', [Validators.required]],
    receiver: ['', [Validators.required]]
  });
  dataSource: MatTableDataSource<RawMaterial>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private ethcontractService: EthcontractService,
    private fb: FormBuilder
  ) {
    localStorage.setItem('shipperpackageidpointer', 0 + '');
    this.initAndDisplayAccount();
  }

  ngOnInit() { }

  initAndDisplayAccount = () => {
    let that = this;
    this.ethcontractService.getRole().then(function (acctInfo: any) {
      console.log(acctInfo)

      that.account = acctInfo.Account;
      that.balance = acctInfo.Balance;
      that.name = acctInfo.Role.Name;
      that.location = acctInfo.Role.Location;
      that.role = that.Roles[acctInfo.Role.Role];

      if (acctInfo.Role.Role != 2) {
        window.alert("User is not Transporter.")
        that.router.navigate(['/']);
      } else {
        that.transportCount();
      }

    }).catch(function (error) {
      console.log(error);
      that.router.navigate(['/']);

    });
  }

  transportCount = async () => {
    let that = this;
    await this.ethcontractService.transportCount().then(function (packageCount: any) {
      console.log(packageCount);
      that.packageCount = packageCount;
    })
    that.getPackageInfo();
  }

  getPackageInfo = async () => {
    let that = this;
    console.log(that.packageCount)
    // that.package_list = [];
    let itrate = true;
    let from = Number(localStorage.getItem('shipperpackageidpointer'));
    let to: Number;
    if (that.packageCount < from + 5) {
      to = that.packageCount;
      localStorage.setItem('shipperpackageidpointer', to + '');
      itrate = false;
    } else if (that.packageCount > from + 5) {
      to = from + 5;
      localStorage.setItem('shipperpackageidpointer', to + '');
    }
    console.log(from, to)
    let i: number;
    for (i = from; i < to; i++) {
      await this.ethcontractService.getTransportBatchIdByIndex({ Index: i }).then(async function (transportationReq: any) {
        if (transportationReq) {
          console.log(transportationReq);
          switch (transportationReq.tarnsType) {
            case 0:
              await that.ethcontractService.getPackageBatchIDDetails({ BatchID: transportationReq.consignmentID }).then(function (packageinforesult: any) {
                if (packageinforesult) {
                  console.log(packageinforesult);
                  let jsonres = {
                    "TxType": 0,
                    "BatchID": transportationReq.consignmentID,
                    "Description": packageinforesult.Description,
                    "FarmerName": packageinforesult.FarmerName,
                    "FarmLocation": packageinforesult.FarmLocation,
                    "Quantity": packageinforesult.Quantity,
                    "Shipper": packageinforesult.Shipper,
                    "Receiver": packageinforesult.Receiver,
                    "Supplier": packageinforesult.Supplier,
                    "Status": that.packageStatus[packageinforesult.Status]
                  }
                  that.package_list.push(jsonres);
                }
              }).catch(function (error) {
                console.log(error);
              });
            case 1:
            case 2:
            case 3:
            case 4:
          }
        }
      }).catch(function (error) {
        console.log(error);
      });
    }
    console.log(that.package_list);
    this.dataSource = new MatTableDataSource<RawMaterial>(that.package_list);
    this.dataSource.paginator = this.paginator;
    console.log(that.dataSource);
    if (itrate) {
      that.getPackageInfo();
    }
  }

  getPackageTx = (selectedBatchID) => {
    let that = this;
    console.log(selectedBatchID);
    // that.packageInfo['Status'] = -1;
    that.packageInfo['TxType'] = 1;
    this.ethcontractService.getRawMatrialStatus({ BatchID: selectedBatchID.BatchID }).then(function (response: any) {
      if (response) {
        that.packageInfo['Batch'] = selectedBatchID;
        that.ethcontractService.getUsers({ AccountAddress: selectedBatchID.Shipper }).then(function (shipperInfo: any) {
          if (shipperInfo) {
            console.log(shipperInfo);
            that.packageInfo['Shipper'] = shipperInfo.result;
            that.ethcontractService.getUsers({ AccountAddress: selectedBatchID.Receiver }).then(function (manufacturerInfo: any) {
              if (manufacturerInfo) {
                console.log(manufacturerInfo);
                that.packageInfo['Manufacturer'] = manufacturerInfo.result;
                that.packageInfo.Status = response.Status;
                console.log(that.packageInfo);

                console.log(response.Status);
                switch (response.Status) {
                  case 0:
                    {
                      console.log("At Creator");
                      that.packageInfo['Batch']['Done'] = true;

                      break;
                    }
                  case 1:
                    {
                      console.log("Picked Up");
                      that.packageInfo['Batch']['Done'] = true;
                      that.packageInfo['Shipper']['Done'] = true;
                      break;
                    }
                  case 2:
                    {
                      console.log("Delivered");
                      that.packageInfo['Batch']['Done'] = true;
                      that.packageInfo['Shipper']['Done'] = true;
                      that.packageInfo['Manufacturer']['Done'] = true;
                      break;
                    }
                }
              }
            });
          }
        });

      }
    }).catch(function (error) {
      console.log(error);
    });

  }

  pickPackage = (pid, txtype, cid) => {
    console.log(this.packageDetails.value);
    let that = this;
    var formdata = {
      PackageID: pid,
      TransporterType: txtype,
      SubContractID: cid
    }
    console.log(formdata)
    this.ethcontractService.loadConsingment(formdata).then(function (txhash: any) {
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
