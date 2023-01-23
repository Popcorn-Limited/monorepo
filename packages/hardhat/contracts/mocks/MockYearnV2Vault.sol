// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.6.0
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./MockERC20.sol";
import "hardhat/console.sol";

contract MockYearnV2Vault is MockERC20 {
  using SafeERC20 for MockERC20;
  using SafeMath for uint256;

  MockERC20 public token;
  uint256 internal _depositLimit = type(uint256).max;
  bool _stubTotalAssets;
  uint256 _totalAssets;
  bool _stubAccountBalance;
  address _stubbedAccount;
  uint256 _stubbedBalance;

  constructor(address token_) MockERC20("Mock crvUSDX yVault", "yvUSDX", 18) {
    token = MockERC20(token_);
  }

  function maxAvailableShares() external view returns (uint256) {
    return totalSupply();
  }

  function balanceOf(address account) public view override returns (uint256) {
    return (_stubAccountBalance && account == _stubbedAccount) ? _stubbedBalance : super.balanceOf(account);
  }

  function balance() public view returns (uint256) {
    return token.balanceOf(address(this));
  }

  function totalAssets() external view returns (uint256) {
    return _stubTotalAssets ? _totalAssets : token.balanceOf(address(this));
  }

  function depositLimit() external view returns (uint256) {
    return _depositLimit;
  }

  function pricePerShare() public view returns (uint256) {
    if (totalSupply() == 0) {
      return 1e18;
    }
    return balance().mul(1e18).div(totalSupply());
  }

  function deposit(uint256 amount) external returns (uint256) {
    token.transferFrom(msg.sender, address(this), amount);
    return _issueSharesForAmount(msg.sender, amount);
  }

  function deposit(uint256 amount, address recipient) external returns (uint256) {
    token.transferFrom(msg.sender, address(this), amount);
    return _issueSharesForAmount(recipient, amount);
  }

  function withdraw(uint256 amount) external returns (uint256) {
    uint256 tokenAmount = _shareValue(amount);
    _burn(msg.sender, amount);
    token.approve(address(this), tokenAmount);
    token.transferFrom(address(this), msg.sender, tokenAmount);
    return tokenAmount;
  }

  function _issueSharesForAmount(address to, uint256 amount) internal returns (uint256) {
    uint256 shares = 0;
    if (this.totalSupply() == 0) {
      shares = amount;
    } else {
      shares = (amount * this.totalSupply()) / (this.totalAssets() - amount);
    }
    _mint(to, shares);
    return shares;
  }

  function _shareValue(uint256 shares) internal view returns (uint256) {
    if (this.totalSupply() == 0) {
      return shares;
    }
    return (shares * this.totalAssets()) / this.totalSupply();
  }

  // Test helpers

  function increasePricePerFullShare(uint256 multiplier) external {
    uint256 newPrice = pricePerShare().mul(multiplier).div(1e18);
    token.burn(address(this), token.balanceOf(address(this)));
    uint256 balanceAmount = newPrice.mul(totalSupply()).div(1e18);
    token.mint(address(this), balanceAmount);
  }

  function setPricePerFullShare(uint256 pricePerFullShare) external {
    token.burn(address(this), token.balanceOf(address(this)));
    uint256 balanceAmount = pricePerFullShare.mul(totalSupply()).div(1e18);
    token.mint(address(this), balanceAmount);
  }

  function setDepositLimit(uint256 newDepositLimit) external {
    _depositLimit = newDepositLimit;
  }

  function stubTotalAssets(uint256 amount) external {
    _stubTotalAssets = true;
    _totalAssets = amount;
  }

  function restoreTotalAssets() external {
    _stubTotalAssets = false;
  }

  function stubAccountBalance(address stubbedAccount, uint256 amount) external {
    _stubAccountBalance = true;
    _stubbedAccount = stubbedAccount;
    _stubbedBalance = amount;
  }

  function restoreStubbedBalance() external {
    _stubAccountBalance = false;
    _stubbedAccount = address(0);
    _stubbedBalance = 0;
  }
}
