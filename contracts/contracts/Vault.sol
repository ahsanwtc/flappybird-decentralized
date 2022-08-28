// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/access/AccessControlEnumerable.sol";

contract Vault is Ownable, AccessControlEnumerable {
  IERC20 private token;
  uint256 public maxWithdrawAmount;
  bool public withdrawEnable;
  bytes32 public constant WITHDRAWER_ROLE = keccak256('WITHDRAWER_ROLE');

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  function setToken(IERC20 _token) public onlyOwner {
    token = _token;
  }

  function deposit(uint256 _amount) external {
    require(!Address.isContract(msg.sender));
    require(token.balanceOf(msg.sender) >= _amount, 'Insufficient funds');
    SafeERC20.safeTransferFrom(token, msg.sender, address(this), _amount);
  }

  function withdraw(uint256 _amount, address _to) external onlyWithdrawer {
    require(!Address.isContract(msg.sender));
    require(withdrawEnable, 'Withdrawl is not available');
    require(_amount <= maxWithdrawAmount, 'Amount is exceeding the maximum amount');
    token.transfer(_to, _amount);
  }

  function setWithdrawEnable(bool _withdrawEnable) public onlyOwner {
    withdrawEnable = _withdrawEnable;
  }

  function setMaxWithdrawAmount(uint256 _maxWithdrawAmount) public onlyOwner {
    maxWithdrawAmount = _maxWithdrawAmount;
  }

  modifier onlyWithdrawer() {
    require(owner() == _msgSender() || hasRole(WITHDRAWER_ROLE, _msgSender()), 'caller is not the withdrawer');
    _;
  }

  receive() external payable {}

}