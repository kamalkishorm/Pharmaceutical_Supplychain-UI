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
  private web3: any;
  private web3Provider: null;
  private contracts: any;
  private contractAddress: "0x0000000000000000000000000000000000000000";
  private coinbase: any;
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

  getRole() {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.web3.eth.getBalance(account, function (err, balance) {
            if (err === null) {
              let SupplyChainContract = TruffleContract(contract);
              SupplyChainContract.setProvider(that.web3Provider);
              SupplyChainContract.deployed().then(function (instance) {
                // console.log(instance);
                that.contractAddress = instance.address;
                return instance.getUserInfo(
                  account,
                  {
                    from: account
                  });
              }).then(function (res) {
                if (res) {
                  // console.log(res[0].substring(0,34))
                  var jsonres = {
                    "Name": that.web3.toAscii(res[0].replace(/0+\b/, "")),
                    "Location": that.web3.toAscii(res[1].replace(/0+\b/, "")),
                    "EthAddress": res[2],
                    "Role": JSON.parse(res[3])
                  }
                  window.jsonres = jsonres;

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

  getOwner() {
    let that = this;
    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          that.web3.eth.getBalance(account, function (err, balance) {
            if (err === null) {
              let SupplyChainContract = TruffleContract(contract);
              SupplyChainContract.setProvider(that.web3Provider);
              SupplyChainContract.deployed().then(function (instance) {
                // console.log(instance.address);
                that.contractAddress = instance.address;
                return instance.Owner();
              }).then(function (res) {
                if (res) {
                  if (res == account) {
                    SupplyChainContract.deployed().then(function (instance) {
                      return instance.getUsersCount();
                    }).then(function (count) {
                      if (count) {
                        return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether"), Role: 'Success', contractAddress: that.contractAddress, UserCount: count });
                      } else {
                        return resolve({ Account: account, Balance: that.web3.fromWei(balance, "ether"), Role: 'Success', contractAddress: that.contractAddress, UserCount: "Error" });
                      }
                    });
                  } else {
                    return resolve({ Role: 'Failure' });
                  }
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



  // getUserInfo(from: number, to: number) {
  //   let that = this;
  //   return new Promise((resolve, reject) => {
  //     let response = [];
  //     let SupplyChainContract = TruffleContract(contract);
  //     SupplyChainContract.setProvider(that.web3Provider);
  //     let i: number;
  //     let flag = false;
  //     for (i = from; i < to;) {
  //       if (!flag) {
  //         continue;
  //       }
  //       flag = true;
  //       SupplyChainContract.deployed().then(function (instance) {
  //         console.log(i);
  //         return instance.getUserbyIndex(Number(i));
  //       }).then(function (uinfo) {
  //         if (uinfo) {
  //           console.log(uinfo);
  //           response.push(uinfo);
  //           flag = false;
  //           i++;
  //         }
  //         if (i == to) {
  //           return resolve({ result: response });
  //         }
  //       }).catch(function (error) {
  //         console.log(error);
  //         return reject("Error in transferEther service call");
  //       });
  //     }

  //   });
  // }

  getUserProfile(index: Number) {
    let that = this;
    return new Promise((resolve, reject) => {
      let SupplyChainContract = TruffleContract(contract);
      SupplyChainContract.setProvider(that.web3Provider);
      SupplyChainContract.deployed().then(function (instance) {
        console.log(index);
        return instance.getUserbyIndex(index);
      }).then(function (uinfo) {
        if (uinfo) {
          var jsonres = {
            "Name": that.web3.toAscii(uinfo[0].replace(/0+\b/, "")),
            "Location": that.web3.toAscii(uinfo[1].replace(/0+\b/, "")),
            "EthAddress": uinfo[2],
            "Role": JSON.parse(uinfo[3])
          }
          return resolve({ result: jsonres });
        }
      }).catch(function (error) {
        console.log(error);
        return reject("Error in transferEther service call");
      });
    });
  }

  registerNewUser(formdata) {
    let that = this;
    formdata.Name = that.web3.padRight(that.web3.fromAscii(formdata.Name), 34);
    formdata.Location = that.web3.padRight(that.web3.fromAscii(formdata.Location), 34);
    return new Promise((resolve, reject) => {

      that.web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          let SupplyChainContract = TruffleContract(contract);
          SupplyChainContract.setProvider(that.web3Provider);
          SupplyChainContract.deployed().then(function (instance) {
            console.log(formdata);
            // var tq = instance.registerUser(formdata.EthAddress, formdata.Name, formdata.Location, formdata.Role, {
            //   from: account
            // })
            // return that.waitForHash(tq);
            return instance.registerUser(formdata.EthAddress, formdata.Name, formdata.Location, formdata.Role, {
              from: account
            }).on('transactionHash', function (hash) {
              resolve(hash);
            });
          }).then(function (result) {
            if (result) {
              return resolve({ result: result });
            } else {
              return reject("Error in tx");
            }
          }).catch(function (error) {
            console.log(error);
            return reject("Error in transactiion call");
          });
          // .on('transactionHash', hash => resolve(hash)).catch(function (error) {
          //   console.log(error);
          //   return reject("Error in transactiion call");
          // });
          // });
        }
      });
    });
  }

  getCount = (formdata) => {
    let that = this;
    formdata.Name = that.web3.padRight(that.web3.fromAscii(formdata.Name), 34);
    formdata.Location = that.web3.padRight(that.web3.fromAscii(formdata.Location), 34);

    return new Promise((resolve, reject) => {
      that.web3.eth.getCoinbase(function (err, account) {

        that.contracts.registerUser(formdata.EthAddress, formdata.Name, formdata.Location, formdata.Role, {
          from: that.coinbase
        }, function (error, result) {
          if (!error)
            resolve(result)
          else
            reject(error);
        })
      });
    });
    // that.web3.eth.sendTransaction(
    //   {
    //     to: "0xa6c51e1059232fE0F4152138B288B401491617a7",
    //     from: account,
    //     value: 10000
    //   }, function (error, result) {
    //     if (!error)
    //       console.log(JSON.stringify(result));
    //     else
    //       console.error(error);
    //   }).on('transactionHash', function (hash) {
    //     resolve(hash);
    //   })
    //   .on('error', reject);
    // .on('transactionHash', hash => resolve(hash)).catch(reject);
  }
}