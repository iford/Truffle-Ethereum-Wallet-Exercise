var wallet = artifacts.require("./MyWallet.sol");
var events;
contract("MyWallet", function(accounts){
  it('should be possible to put money inside', function(){
    var contractInstance;
    return wallet.deployed().then(function(instance){
      contractInstance = instance;
      return contractInstance.sendTransaction({value: web3.toWei(10,'ether'), address: contractInstance.address, from: accounts[0]});
    }).then(function(results){
      assert.equal(web3.eth.getBalance(contractInstance.address).toNumber(), web3.toWei(10, 'ether'), 'The balance is the same');
    });
  });

 it('should be possible to get back money back as the owner', function(){
  var walletInstance;
  var balanceBeforeSend;
  var balanceAfterSend;
  var amountToSend = web3.toWei(5,'ether');
  return wallet.deployed().then(function(instance){
    walletInstance = instance;
    balanceBeforeSend = web3.eth.getBalance(instance.address).toNumber();
    return walletInstance.spendMoneyOn(accounts[1], amountToSend, "Because I'm the owner", {from:accounts[0]});

  }).then(function(tx){
    console.log("txLog = " + JSON.stringify(tx));
    console.log("walletInstance.address = " + walletInstance.address);
    console.log("accounts[1].address = " + accounts[1]);
    console.log("accounts[0].address = " + accounts[0]);
    return web3.eth.getBalance(walletInstance.address).toNumber();
  }).then(function(balance){

    balanceAfterSend = balance;
    console.log("balanceBeforeSend = "+ balanceBeforeSend + " amountToSend = " + amountToSend+ " balanceAfter = " + balanceAfterSend);
    assert.equal(balanceBeforeSend - amountToSend, balanceAfterSend, "balance is now 5 ether less than before");
    // assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), web3.eth.getBalance(walletInstance.address).toNumber(), "balance is now 5 ether less than before");
  });

});

it('should be possible to propose and confirm spending money', function() {
    var walletInstance;
    return wallet.deployed().then(function(instance) {
        walletInstance = instance;
        return walletInstance.spendMoneyOn(accounts[1], web3.toWei(5,'ether'), "Because I need money", {from: accounts[1]});
    }).then(function() {
        console.log("walletInstance.balance = " + web3.eth.getBalance(walletInstance.address).toNumber());
        assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), web3.toWei(5,'ether'), 'Balance is now 5 ether less than before');
    });
  });

it('should be possible to confirm Proposal', function() {
    var walletInstance;
    return wallet.deployed().then(function(instance) {
        walletInstance = instance;
        events = walletInstance.confirmProposalEvent({}, {fromBlock:'latest', toBlock:'latest' });
        events.watch(function(error, result){
	 			   if(error){
	 				    console.error(error);
	 			   }else{
              assert.equal(result.args._to, accounts[1], 'confirm address is not saam');
	 				    console.log('_to address='+result.args._to);
	 				    console.log('amount='+result.args._amount);
              events.stopWatching();
	 			   }
          });
        return walletInstance.confirmProposal(1, {from: accounts[0]});

    }).then(function(tx){
        console.log("txAgrs=",tx.logs[0].args);
        return web3.eth.getBalance(walletInstance.address).toNumber();
    }).then(function(balance) {

        assert.equal(balance, web3.toWei(0,'ether'), 'proposal is not confirm');
        // assert.equal(tx.logs[0].event, 'confirmProposalEvent', 'confirm event is not saam');
    });
  });


});
