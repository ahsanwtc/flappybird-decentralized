const { expect } = require("chai");
const { expectRevert } = require('@openzeppelin/test-helpers');
const { ethers } = require('hardhat');
const { keccak256 } = require('ethers/lib/utils');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const parseEther = amount => ethers.utils.parseUnits(amount.toString(), 18);

describe("Vault", function () {
  let owner, alice, bob, carol, vault, token;

  beforeEach(async () => {
    /* reset EVM to get a fresh copy  */
    await ethers.provider.send('hardhat_reset', []);
    [owner, alice, bob, carol] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory('Vault', owner);
    vault = await Vault.deploy();

    const Token = await ethers.getContractFactory('Flappy', owner);
    token = await Token.deploy();
    await vault.setToken(token.address);

  });

  /* 
    Happy Path 
  */

  it('should deposit into the Vault', async () => {
    await token.transfer(alice.address, parseEther(1 * 10 ** 6));
    await token.connect(alice).approve(vault.address, token.balanceOf(alice.address));
    await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));
    expect(await token.balanceOf(vault.address)).equal(parseEther(500 * 10 ** 3));
  });

  it('should withdraw', async () => {
    /* grant withdrawer role to bob */
    const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
    await vault.grantRole(WITHDRAWER_ROLE, bob.address);

    await vault.setWithdrawEnable(true);
    
    /* max withdraw amount set to 1M tokens */
    await vault.setMaxWithdrawAmount(parseEther(1 * 10 ** 6));

    /* transfer 1M token to alice's wallet */
    await token.transfer(alice.address, parseEther(1 * 10 ** 6));

    await token.connect(alice).approve(vault.address, token.balanceOf(alice.address));
    
    /* alice deposits 500k tokens into vault */
    await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

    /* bob withdraws token to alice's address */
    await vault.connect(bob).withdraw(parseEther(300 * 10 ** 3), alice.address);

    /* after withdrawal, vault balance should be 200k */
    expect(await token.balanceOf(vault.address)).equal(parseEther(200 * 10 ** 3));

    /* after withdrawal, alice balance should be 800k */
    expect(await token.balanceOf(alice.address)).equal(parseEther(800 * 10 ** 3));
  });

  /* 
    Unhappy Path 
  */

  it.skip('should NOT deposit into the Vault, Insufficient funds', async () => {
    await token.transfer(alice.address, parseEther(1 * 10 ** 6));
    await token.connect(alice).approve(vault.address, token.balanceOf(alice.address));
    // await expectRevert(
    //   await vault.connect(alice).deposit(parseEther(1.1 * 10 ** 6)),
    //   'Insufficient funds'
    // );
    await expect(vault.connect(alice).deposit(parseEther(1.1 * 10 ** 6))).revertedWith('Insufficient funds');
  });

  it('should NOT withdraw, Withdrawl is not available', async () => {
    /* grant withdrawer role to bob */
    const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
    await vault.grantRole(WITHDRAWER_ROLE, bob.address);

    await vault.setWithdrawEnable(false);
    
    /* max withdraw amount set to 1M tokens */
    await vault.setMaxWithdrawAmount(parseEther(1 * 10 ** 6));

    /* transfer 1M token to alice's wallet */
    await token.transfer(alice.address, parseEther(1 * 10 ** 6));

    await token.connect(alice).approve(vault.address, token.balanceOf(alice.address));
    
    /* alice deposits 500k tokens into vault */
    await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

    /* bob withdraws token to alice's address */
    await expect(vault.connect(bob).withdraw(parseEther(300 * 10 ** 3), alice.address)).revertedWith('Withdrawl is not available');
  });

  it('should NOT withdraw, Amount is exceeding the maximum amount', async () => {
    /* grant withdrawer role to bob */
    const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
    await vault.grantRole(WITHDRAWER_ROLE, bob.address);

    await vault.setWithdrawEnable(true);
    
    /* max withdraw amount set to 100k tokens */
    await vault.setMaxWithdrawAmount(parseEther(100 * 10 ** 3));

    /* transfer 1M token to alice's wallet */
    await token.transfer(alice.address, parseEther(1 * 10 ** 6));

    await token.connect(alice).approve(vault.address, token.balanceOf(alice.address));
    
    /* alice deposits 500k tokens into vault */
    await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

    /* bob withdraws token to alice's address */
    await expect(vault.connect(bob).withdraw(parseEther(300 * 10 ** 3), alice.address)).revertedWith('Amount is exceeding the maximum amount');
  });

  it('should NOT withdraw, caller is not the withdrawer', async () => {
    /* grant withdrawer role to bob */
    const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
    await vault.grantRole(WITHDRAWER_ROLE, bob.address);

    await vault.setWithdrawEnable(true);
    
    /* max withdraw amount set to 100k tokens */
    await vault.setMaxWithdrawAmount(parseEther(100 * 10 ** 3));

    /* transfer 1M token to alice's wallet */
    await token.transfer(alice.address, parseEther(1 * 10 ** 6));

    await token.connect(alice).approve(vault.address, token.balanceOf(alice.address));
    
    /* alice deposits 500k tokens into vault */
    await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

    /* carol withdraws token to alice's address */
    await expect(vault.connect(carol).withdraw(parseEther(100 * 10 ** 3), alice.address)).revertedWith('caller is not the withdrawer');
  });

  it('should NOT withdraw, ERC20: transfer amount exceeds balance', async () => {
    /* grant withdrawer role to bob */
    const WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
    await vault.grantRole(WITHDRAWER_ROLE, bob.address);

    await vault.setWithdrawEnable(true);
    
    /* max withdraw amount set to 1M tokens */
    await vault.setMaxWithdrawAmount(parseEther(1 * 10 ** 6));

    /* transfer 1M token to alice's wallet */
    await token.transfer(alice.address, parseEther(1 * 10 ** 6));

    await token.connect(alice).approve(vault.address, token.balanceOf(alice.address));
    
    /* alice deposits 500k tokens into vault */
    await vault.connect(alice).deposit(parseEther(500 * 10 ** 3));

    /* bob withdraws token to alice's address */
    await expect(vault.connect(bob).withdraw(parseEther(600 * 10 ** 3), alice.address)).revertedWith('ERC20: transfer amount exceeds balance');
  });
  
});
