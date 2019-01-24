import { Injectable } from '@angular/core';
import * as Web3 from 'web3';
import * as TruffleContract from 'truffle-contract';
import { resolve, reject } from 'q';
declare let require: any;
declare let window: any;
let contract = require('./shared/Contracts/supplychain.json');
@Injectable({
  providedIn: 'root'
})
export class EthcontractService {

  /************************************************* Variables *************************************/
  private web3: any;
  private web3Provider: null;
  private contracts: any;
  private contractAddress: "0x0000000000000000000000000000000000000000";
  private coinbase: "0x0000000000000000000000000000000000000000";

  /************************************************* Constructor ***********************************/
  constructor() {
    if (typeof window.web3 !== 'undefined') {
      this.web3Provider = window.web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    window.web3 = new Web3(this.web3Provider);
    this.web3 = window.web3;
    this.contracts = this.web3.eth.contract(
      contract.abi
    ).at(contract.networks[this.web3.currentProvider.networkVersion].address);
    window.contract = contract;
    window.contracts = this.contracts;
    this.getcoinbase();
    console.log(this.contracts);
  }

  /************************************************* Basic *****************************************/
  getcoinbase() {
    let that = this;
    that.web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        that.coinbase = account;
      }
    });
  }

  getAccountInfo() {
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
  getOwner() {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.web3.eth.getBalance(account, function (err, balance) {
            if (err === null) {
              that.contracts.Owner(function (error, ownerAddress) {
                if (!error) {
                  if (ownerAddress == account) {
                    that.contracts.getUsersCount(function (error, userCount) {
                      if (!error) {
                        return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether"), Role: 'Success', contractAddress: that.contractAddress, UserCount: JSON.parse(userCount) });
                      }
                      else
                        return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether"), Role: 'Success', contractAddress: that.contractAddress, UserCount: "Error" });
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
      // that.web3.eth.getCoinbase(function (err, account) {
      that.contracts.registerUser(formdata.EthAddress, formdata.Name, formdata.Location, formdata.Role, {
        from: that.coinbase
      }, function (error, result) {
        if (!error)
          resolve(result)
        else
          reject(error);
      })
    });
    // });
  }

  /************************************************* Users *****************************************/
  getRole() {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.web3.eth.getBalance(account, function (err, balance) {
            if (err === null) {
              that.contracts.getUserInfo(
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
                    return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether"), Role: jsonres, contractAddress: that.contractAddress });
                  }
                }).catch(function (error) {
                  console.log(error);
                  return reject("Error in transferEther service call");
                });
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

  getUserCount() {
    let that = this;
    return new Promise((resolve, reject) => {
      that.contracts.getUsersCount(function (error, userCount) {
        if (!error) {
          return resolve({ UserCount: JSON.parse(userCount) });
        }
        else
          return reject(error);
      });
    });
  }

  getUserProfile(index: Number) {
    let that = this;
    return new Promise((resolve, reject) => {
      that.contracts.getUserbyIndex(index, {
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

  /************************************************* Supplier *************************************/


}