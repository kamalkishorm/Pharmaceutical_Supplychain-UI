import { Component, OnInit, ViewChild, } from '@angular/core';
import { EthcontractService } from '../../ethcontract.service';
import { Router } from '@angular/router';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { RawMaterial } from './rawmattable';
import { Medicine } from './medicinetable';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormControl, NgSelectOption, FormArray } from '@angular/forms';
import { async } from 'q';
import * as $ from 'jquery';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-user-manufacturer',
  templateUrl: './manufacturer.component.html',
  styleUrls: ['./manufacturer.component.css']
})
export class ManufacturerComponent implements OnInit {

  // quantity: any[]=[];
  account = "0x0";
  balance = '0 ETH';
  amount = 0;
  name: any;
  location: any;
  role: any;
  rawRemain:{};
  rawPackageCount: 0;
  batchCount: 0;
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
    'batchid',
    'description',
    'farmername',
    'location',
    'initquantity',
    'usedquantity',
    'shipper',
    'receiver',
    'status',
    'star'
  ];

  displayedMedicineColumns: string[] = [
    'batchid',
    'description',
    'farmername',
    'location',
    'quantity',
    'shipper',
    'receiver',
    'status',
    'star'
  ];


  packageInfo = {};
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
  rawSource: MatTableDataSource<RawMaterial>;

  medicineDetails = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(16)]],
    quantity: [0, [Validators.required]],
    shipper: ['', [Validators.required]],
    receiver: ['', [Validators.required]],
    receivertype: [1, [Validators.required]],
    rawmaterial: this.fb.array([
      this.fb.group({
        pid:[''],
        quantity: [0]
      })
    ])
  });
  MedicineSource: MatTableDataSource<Medicine>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  rawreceivepid = this.fb.group({
    pid: ['', [Validators.required]]
  });
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private ethcontractService: EthcontractService,
    private fb: FormBuilder
  ) {
    localStorage.setItem('rawpackageatMpointer', 0 + '');
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

      if (acctInfo.Role.Role != 3) {
        window.alert("User is not Manufacturer.")
        that.router.navigate(['/']);
      } else {
        that.getPackagesCountM();
        that.getBatchesCountM();

      }

    }).catch(function (error) {
      console.log(error);
      that.router.navigate(['/']);

    });
  }

  getPackagesCountM = async () => {
    let that = this;
    await this.ethcontractService.getPackagesCountM().then(function (packageCount: any) {
      console.log(packageCount);
      that.rawPackageCount = packageCount;
    })
    that.getPackageInfo();
  }
  getBatchesCountM = async () => {
    let that = this;
    await this.ethcontractService.getBatchesCountM().then(function (packageCount: any) {
      console.log(packageCount);
      that.batchCount = packageCount;
    })
    that.getBatchesInfo();
  }

  rawPackageReceived = () => {
    let that = this;
    var formdata = {
      PackageID: this.rawreceivepid.value.pid
    }
    console.log("data received "+formdata);

    this.ethcontractService.rawPackageReceived(formdata).then(function (txhash: any) {
      if (txhash) {
        console.log(txhash);
        that.handleTransactionResponse(txhash);
      }
    }).catch(function (error) {
      console.log(error);
    });
  }

  getPackageInfo = async () => {
    let that = this;
    console.log(that.rawPackageCount)
    // that.package_list = [];
    let itrate = true;
    let from = Number(localStorage.getItem('rawpackageatMpointer'));
    let to: Number;
    if (that.rawPackageCount < from + 5) {
      to = that.rawPackageCount;
      localStorage.setItem('rawpackageatMpointer', to + '');
      itrate = false;
    } else if (that.rawPackageCount > from + 5) {
      to = from + 5;
      localStorage.setItem('rawpackageatMpointer', to + '');
    }
    let i: number;
    for (i = from; i < to; i++) {
      await this.ethcontractService.getPackageIDByIndexM({Index:i}).then(async function (batchid: any) {
        if (batchid) {
          console.log(batchid);
          await that.ethcontractService.getPackageBatchIDDetails({BatchID:batchid[0]}).then(function (packageinfo: any) {
            if (packageinfo) {
              console.log(packageinfo);
              let jsonres = {
                "BatchID": batchid[0],
                "Description": packageinfo.Description,
                "FarmerName": packageinfo.FarmerName,
                "FarmLocation": packageinfo.FarmLocation,
                "InitQuantity": packageinfo.Quantity,
                "UsedQuantity": JSON.parse(batchid[1]),
                "Shipper": packageinfo.Shipper,
                "Receiver": packageinfo.Receiver,
                "Supplier": packageinfo.Supplier,
                "Status": that.packageStatus[packageinfo.Status]
              }
              var reamin = (Number(packageinfo.Quantity) - Number(JSON.parse(batchid[1]))); 
              var bid = batchid[0];
              console.log(bid,reamin)
              that.rawRemain[batchid[0].toString()] = reamin;
              // Object.assign(that.rawRemain,{thisbid : reamin});
              console.log(that.rawRemain);
              that.package_list.push(jsonres);
            }
            console.log("initial quantity"+packageinfo.Quantity)
          });
        }
      }).catch(function (error) {
        console.log(error);
      });
    }

    console.log(that.package_list);
    this.rawSource = new MatTableDataSource<RawMaterial>(that.package_list);
    this.rawSource.paginator = this.paginator;
    console.log(that.rawSource);
    if (itrate) {
      that.getPackageInfo();
    }
  }

  getPackageTx = (selectedBatchID) => {
    let that = this;
    console.log(selectedBatchID);
    that.packageInfo['Status'] = -1;
    this.ethcontractService.getRawMatrialStatus({BatchID:selectedBatchID.BatchID}).then(function (response: any) {
      if (response) {
        that.packageInfo['Batch'] = selectedBatchID;
        that.ethcontractService.getUsers({AccountAddress:selectedBatchID.Shipper}).then(function (shipperInfo: any) {
          if (shipperInfo) {
            console.log(shipperInfo);
            that.packageInfo['Shipper'] = shipperInfo.result;
            that.ethcontractService.getUsers({AccountAddress:selectedBatchID.Receiver}).then(function (manufacturerInfo: any) {
              if (manufacturerInfo) {
                console.log(manufacturerInfo);
                that.packageInfo['Manufacturer'] = manufacturerInfo.result;
                that.packageInfo['Status'] = response.Status;
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

  createMedicine = () => {

    // console.log("initial quantity"+this.)

    console.log(this.medicineDetails.value);
    let that = this;
    var formdata = {
      Description: this.medicineDetails.value.description,
      ReceiverType: this.medicineDetails.value.receivertype,
      Quantity: this.medicineDetails.value.quantity,
      Shipper: this.medicineDetails.value.shipper,
      Receiver: this.medicineDetails.value.receiver,
      RawMaterialNew: this.medicineDetails.value.rawmaterial, 
      RawDes: "Done"
    }
    console.log("rawmaterial "+ this.rawmaterial);
    // console.log(" jsonres quantity" + this.quantity);

    for (var i=0; i<2; i++){
      formdata.RawMaterialNew <= ''
    }


console.log("Data" +formdata)
    // this.ethcontractService.createRawPackage(formdata).then(function (txhash: any) {
    //   if (txhash) {
    //     console.log(txhash);
    //     that.handleTransactionResponse(txhash);
    //   }
    // }).catch(function (error) {
    //   console.log(error);
    // });
  }
  get rawmaterial() {
    return this.medicineDetails.get('rawmaterial') as FormArray;
  }
  addRawMat = () => {
      this.rawmaterial.push(
        this.fb.group({
          pid:[''],
          quantity:[0]
        }));
  }
  getBatchesInfo = () => {

  }
  getBatchTx = () => {

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
