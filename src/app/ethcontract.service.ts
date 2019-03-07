import { Injectable } from '@angular/core';
import * as Web3 from 'web3';
import * as TruffleContract from 'truffle-contract';
import { resolve, reject } from 'q';
import { ConstantPool } from '@angular/compiler';
// import { copyFileSync } from 'fs';
declare let require: any;
declare let window: any;
let contract = require('./shared/Contracts/SupplyChain.json');
let contract_SupplyChain = require('./shared/Contracts/SupplyChain.json');
let contract_RawMatrials = require('./shared/Contracts/RawMatrials.json');
let contract_MedicineW_D = require('./shared/Contracts/MedicineW_D.json');
let contract_MedicineD_P = require('./shared/Contracts/MedicineD_P.json');
let contract_Medicine = require('./shared/Contracts/Medicine.json');

@Injectable({
  providedIn: 'root'
})
export class EthcontractService {

  /************************************************* Variables *************************************/
  private web3: any;
  private web3Provider: null;
  private contracts: any;
  private coinbase: "0x0000000000000000000000000000000000000000";

  private contracts_SupplyChain: any;
  private contracts_RawMatrials: any;
  private contracts_MedicineW_D: any;
  private contracts_MedicineD_P: any;
  private contracts_Medicine: any;


  private contractAddress_SupplyChain: "0x0000000000000000000000000000000000000000";


  /************************************************* Constructor ***********************************/
  constructor() {
    try {

      if (typeof window.web3 !== 'undefined') {
        this.web3Provider = window.web3.currentProvider;
      } else {
        this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      window.web3 = new Web3(this.web3Provider);
      this.web3 = window.web3;

      this.contracts_SupplyChain = this.web3.eth.contract(
        contract_SupplyChain.abi
      ).at(contract_SupplyChain.networks[this.web3.currentProvider.networkVersion].address);

      this.contractAddress_SupplyChain = contract_SupplyChain.networks[this.web3.currentProvider.networkVersion].address;

      // window.contract = contract;
      window.contracts = this.contracts_SupplyChain;
      this.getcoinbase();
      console.log(this.contracts_SupplyChain);
    } catch (err) {
      return err;
    }
  }
  /************************************************* Basic *****************************************/
  getcoinbase = () => {
    let that = this;
    that.web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        that.coinbase = account;
      }
    });
  }

  getAccountInfo = () => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.web3.eth.getBalance(account, function (err, balance) {
            if (err === null) {
              return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether") });
            } else {
              return reject("error!");
            }
          });
        }
      });
    });
  }

  /************************************************* Admin *****************************************/
  getOwner = () => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.web3.eth.getBalance(account, function (err, balance) {
            if (err === null) {
              that.contracts_SupplyChain.Owner(function (error, ownerAddress) {
                if (!error) {
                  if (ownerAddress == account) {
                    // that.contracts_SupplyChain.getUsersCount(function (error, userCount) {
                    that.contracts_SupplyChain.getUsersCount(function (error, userCount) {
                      if (!error) {
                        return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether"), Role: 'Success', contractAddress: that.contractAddress_SupplyChain, UserCount: JSON.parse(userCount) });
                      }
                      else
                        return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether"), Role: 'Success', contractAddress: that.contractAddress_SupplyChain, UserCount: "Error" });
                    })
                  }
                  else {
                    return resolve({ Role: 'Failure' });
                  }
                }
                else
                  reject(error);
              })
            } else {
              return reject("error!");
            }
          });
        } else {
          return reject("No Coinbase!");
        }
      });
    });
  }

  registerNewUser = (formdata) => {
    let that = this;
    formdata.Name = that.web3.padRight(that.web3.fromAscii(formdata.Name), 34);
    formdata.Location = that.web3.padRight(that.web3.fromAscii(formdata.Location), 34);

    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {

          // that.contracts_SupplyChain.registerUser(formdata.EthAddress, formdata.Name, formdata.Location, formdata.Role, {
          that.contracts_SupplyChain.registerUser(formdata.EthAddress, formdata.Name, formdata.Location, formdata.Role, {
            from: account
          }, function (error, result) {
            if (!error)
              resolve(result)
            else
              reject(error);
          });
        }
      });
    });
  }

  /************************************************* Users *****************************************/
  getRole = () => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.web3.eth.getBalance(account, function (err, balance) {
            if (err === null) {
              // that.contracts_SupplyChain.getUserInfo(
              that.contracts_SupplyChain.getUserInfo(
                account,
                {
                  from: account
                }, function (error, res) {
                  if (res) {
                    // console.log(res[0].substring(0,34))
                    var jsonres = {
                      "Name": that.web3.toAscii(res[0].replace(/0+\b/, "")),
                      "Location": that.web3.toAscii(res[1].replace(/0+\b/, "")),
                      "EthAddress": res[2],
                      "Role": JSON.parse(res[3])
                    }
                    return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether"), Role: jsonres });
                  }
                  else {
                    return reject(error);
                  }
                });
            } else {
              return reject(err);
            }
          });
        } else {
          return reject(err);
        }
      });
    });
  }

  getUserCount = () => {
    let that = this;
    return new Promise((resolve, reject) => {
      // that.contracts_SupplyChain.getUsersCount(function (error, userCount) {
      that.contracts_SupplyChain.getUsersCount(function (error, userCount) {
        if (!error) {
          return resolve({ UserCount: JSON.parse(userCount) });
        }
        else
          return reject(error);
      });
    });
  }

  getUserProfile = (index: Number) => {
    let that = this;
    return new Promise((resolve, reject) => {
      // that.contracts_SupplyChain.getUserbyIndex(index, {
      that.contracts_SupplyChain.getUserbyIndex(index, {
        from: that.coinbase
      }, function (error, uinfo) {
        if (!error) {
          var jsonres = {
            "Name": that.web3.toAscii(uinfo[0].replace(/0+\b/, "")),
            "Location": that.web3.toAscii(uinfo[1].replace(/0+\b/, "")),
            "EthAddress": uinfo[2],
            "Role": JSON.parse(uinfo[3])
          }
          console.log(jsonres);
          resolve({ result: jsonres });
        }
        else
          reject(error);
      })
    });
  }

  getUsers = (account) => {
    let that = this;
    return new Promise((resolve, reject) => {
      // that.contracts_SupplyChain.getUserInfo(account,
      that.contracts_SupplyChain.getUserInfo(account,
        function (error, uinfo) {
          if (!error) {
            var jsonres = {
              "Name": that.web3.toAscii(uinfo[0].replace(/0+\b/, "")),
              "Location": that.web3.toAscii(uinfo[1].replace(/0+\b/, "")),
              "EthAddress": uinfo[2],
              "Role": JSON.parse(uinfo[3])
            }
            console.log(jsonres);
            resolve({ result: jsonres });
          }
          else
            reject(error);
        });
    });
  }
  /************************************************* Supplier *************************************/

  createRawPackage = (formdata) => {
    let that = this;
    formdata.Description = that.web3.padRight(that.web3.fromAscii(formdata.Description), 34);
    formdata.FarmerName = that.web3.padRight(that.web3.fromAscii(formdata.FarmerName), 34);
    formdata.Location = that.web3.padRight(that.web3.fromAscii(formdata.Location), 34);

    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          // that.contracts_SupplyChain.supplyRaw(formdata.Description, formdata.FarmerName, formdata.Location, formdata.Quantity, formdata.Shipper, formdata.Receiver, {
          that.contracts_SupplyChain.createRawPackage(formdata.Description, formdata.FarmerName, formdata.Location, formdata.Quantity, formdata.Shipper, formdata.Receiver, {
            from: account
          }, function (error, result) {
            if (!error)
              resolve(result)
            else
              reject(error);
          })
        }
        else
          reject(err);
      });
    });
  }

  getPackageCount = () => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {

          // that.contracts_SupplyChain.getCountOfProducts({
          that.contracts_SupplyChain.getPackagesCountS({
            from: account
          }, function (error, result) {
            if (!error)
              resolve(JSON.parse(result));
            else
              reject(error);
          })
        }
      });
    });
  }

  getPackageBatchID = (index) => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          // that.contracts_SupplyChain.getProductIdByIndex(index, {
          that.contracts_SupplyChain.getPackageIdByIndexS(index, {
            from: account
          }, function (error, result) {
            // console.log(result);
            if (!error)
              resolve(result);
            else
              reject(error);
          })
        }
      });
    });
  }

  getPackageBatchIDDetails = (batchid) => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          let contracts_RawMatrials = that.web3.eth.contract(
            contract_RawMatrials.abi
          ).at(batchid);
          contracts_RawMatrials.getSuppliedRawMatrials({
            from: account
          }, function (error, result) {
            if (!error) {
              contracts_RawMatrials.getRawMatrialsStatus(function (error, status) {
                if (!error) {
                  let jsonres = {
                    "Description": that.web3.toAscii(result[0].replace(/0+\b/, "")),
                    "FarmerName": that.web3.toAscii(result[1].replace(/0+\b/, "")),
                    "FarmLocation": that.web3.toAscii(result[2].replace(/0+\b/, "")),
                    "Quantity": JSON.parse(result[3]),
                    "Shipper": result[4],
                    "Receiver": result[5],
                    "Supplier": result[6],
                    "Status": JSON.parse(status)
                  }
                  resolve(jsonres);
                } else {
                  return reject(error);
                }
              });

            }
            else
              reject(error);
          })
        }
      });
    });
  }

  getRawMatrialStatus = (batchid) => {
    let that = this;
    return new Promise((resolve, reject) => {
      let contracts_RawMatrials = that.web3.eth.contract(
        contract_RawMatrials.abi
      ).at(batchid);
      contracts_RawMatrials.getRawMatrialsStatus(function (error, result) {
        if (!error) {
          return resolve({ "Status": JSON.parse(result) });
        } else {
          return reject(error);
        }
      });
    });
  }

  getPackagesCountM = () => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {

          // that.contracts_SupplyChain.getCountOfProducts({
          that.contracts_SupplyChain.getPackagesCountM({
            from: account
          }, function (error, result) {
            if (!error)
              resolve(JSON.parse(result));
            else
              reject(error);
          })
        }
      });
    });
  }
  getBatchesCountM = () => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {

          // that.contracts_SupplyChain.getCountOfProducts({
          that.contracts_SupplyChain.getBatchesCountM({
            from: account
          }, function (error, result) {
            if (!error)
              resolve(JSON.parse(result));
            else
              reject(error);
          })
        }
      });
    });
  }
  transportCount = () => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {

          // that.contracts_SupplyChain.getCountOfProducts({
          that.contracts_SupplyChain.transportCount({
            from: account
          }, function (error, result) {
            if (!error)
              resolve(JSON.parse(result));
            else
              reject(error);
          })
        }
      });
    });
  }

  getTransportBatchIdByIndex = (index) => {
    let that = this;
    console.log(index)
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.contracts_SupplyChain.getTransportBatchIdByIndex(index, {
            from: account
          }, function (err, result) {
            console.log(err, result)

            if (!err) {
              return resolve({ "consignmentID": result[0], "tarnsType": JSON.parse(result[1]) });
            } else {
              return reject(err);
            }
          });
        }
      });
    });
  }
  /************************************************* Transporter *************************************/
  loadConsingment = (formdata) => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.contracts_SupplyChain.loadConsingment(formdata.pid, formdata.transportertype, formdata.cid, {
            from: account
          }, function (error, result) {
            if (!error)
              resolve(result)
            else
              reject(error);
          });
        }
      });
    });
  }
  /************************************************* Manufecturer *************************************/
  rawPackageReceived = (formdata) => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.contracts_SupplyChain.rawPackageReceived(formdata.pid, {
            from: account
          }, function (error, result) {
            if (!error)
              resolve(result)
            else
              reject(error);
          });
        }
      });
    });
  }
  getPackageBatchIDM = (index) => {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          // that.contracts_SupplyChain.getProductIdByIndex(index, {
          that.contracts_SupplyChain.getPackageIDByIndexM(index, {
            from: account
          }, function (error, result) {
            // console.log(result);
            if (!error)
              resolve(result);
            else
              reject(error);
          })
        }
      });
    });
  }
}
