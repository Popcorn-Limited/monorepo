// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FeeEscrow {
  /* ========== STATE VARIABLES ========== */

  /**
   * feeTokenAddress to burnerAddress
   */
  mapping(address => address) public feeTokenToBurnerAddress;

  /* ========== EVENTS ========== */

  event BurnerAddressAdded(address indexed feeToken, address indexed burnerAddress);
  event BurnerAddressRemoved(address indexed feeToken);
  event BurnerAddressChanged(address indexed feeToken, address indexed burnerAddress);
  event FeesBurned(address indexed feeToken, uint256 burnAmount);

  /* ========== VIEW FUNCTIONS ========== */

  /**
   * @return burnerAddress for the specified feeToken
   * @param _feeToken the token to look up registered burner address
   * */
  function getBurnerAddress(address _feeToken) external view returns (address) {
    require(feeTokenToBurnerAddress[_feeToken] != address(0), "burner address not registered");
    return feeTokenToBurnerAddress[_feeToken];
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice adds burner address for a feeToken to storage mapping
   * @param _feeToken the token that will have the registered burner address
   * @param _burnerAddress the address to send _feeToken to burn
   * */
  function addBurnerAddress(address _feeToken, address _burnerAddress) external {
    require(_feeToken != address(0), "need to specify fee token");
    require(_burnerAddress != address(0), "need to specify burner address");
    feeTokenToBurnerAddress[_feeToken] = _burnerAddress;
    emit BurnerAddressAdded(_feeToken, _burnerAddress);
  }

  /**
   * @notice removes burner address from storage mapping
   * @param _feeToken the token that will have the registered burner address removed from
   * */
  function removeBurnerAddress(address _feeToken) external {
    require(_feeToken != address(0), "need to specify fee token");
    delete feeTokenToBurnerAddress[_feeToken];
    emit BurnerAddressRemoved(_feeToken);
  }

  /**
   * @notice changes burner address for a feeToken in storage mapping
   * @param _feeToken the token that will have the registered burner address changed
   * @param _burnerAddress the new address to send _feeToken to burn
   * @dev expects the old burnerAddress to not be address(0)
   * */
  function changeBurnerAddress(address _feeToken, address _burnerAddress) external {
    require(_feeToken != address(0), "need to specify fee token");
    require(_burnerAddress != address(0), "need to specify burner address");
    require(feeTokenToBurnerAddress[_feeToken] != address(0), "no burner address registered");
    feeTokenToBurnerAddress[_feeToken] = _burnerAddress;
    emit BurnerAddressChanged(_feeToken, _burnerAddress);
  }

  /**
   * @notice permissionless function that sends fees to the burner which is registered for that token address, and if one does not exist it will revert
   * @param _feeToken the token that will be sent to the registered burner address to be burned
   * @param _burnAmount amount of feeToken to burn
   * @dev user must first approve FeeEscrow contract to transfer _burnAmount from _feeToken
   * */
  function transferFees(address _feeToken, uint256 _burnAmount) external {
    require(feeTokenToBurnerAddress[_feeToken] != address(0), "no burner address registered");
    require(_burnAmount > 0, "burn amount must be > 0");
    IERC20(_feeToken).transferFrom(msg.sender, feeTokenToBurnerAddress[_feeToken], _burnAmount);
    emit FeesBurned(_feeToken, _burnAmount);
  }
}
