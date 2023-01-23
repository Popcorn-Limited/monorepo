// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../../utils/ContractRegistryAccess.sol";
import "../../utils/ACLAuth.sol";
import "../../utils/KeeperIncentivized.sol";
import "../../../externals/interfaces/yearn/IVault.sol";
import "../../../externals/interfaces/IBasicIssuanceModule.sol";
import "../../../externals/interfaces/ISetToken.sol";
import "../../../externals/interfaces/Curve3Pool.sol";
import "../../../externals/interfaces/CurveContracts.sol";
import "../../../externals/interfaces/IAngleRouter.sol";
import "../../interfaces/IContractRegistry.sol";
import "../../interfaces/IBatchStorage.sol";
import { IThreeXBatchProcessing, ComponentDependencies } from "../../interfaces/IThreeXBatchProcessing.sol";
import "./ThreeXBatchVault.sol";
import "./controller/AbstractBatchController.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ThreeXWhaleProcessing is AbstractFee, ContractRegistryAccess, AbstractBatchController {
  using SafeERC20 for IVault;
  using SafeERC20 for ISetToken;
  using SafeERC20 for IERC20;
  using SafeERC20 for CurveMetapool;

  /* ========== STATE VARIABLES ========== */

  bytes32 public constant contractName = "ThreeXWhaleProcessing";

  IBasicIssuanceModule public basicIssuanceModule;
  Curve3Pool private threePool;
  IERC20[3] public token; // [dai,usdc,usdt]

  /* ========== EVENTS ========== */

  event Minted(uint256 inputAmount, uint256 outputAmount);
  event Redeemed(uint256 suppliedTokenAmount, uint256 outputAmount);

  /* ========== CONSTRUCTOR ========== */

  constructor(
    IContractRegistry __contractRegistry,
    IBasicIssuanceModule _basicIssuanceModule,
    IStaking _staking,
    Curve3Pool _threePool,
    IERC20[3] memory _token
  ) AbstractBatchController(_contractRegistry) ContractRegistryAccess(__contractRegistry) {
    basicIssuanceModule = _basicIssuanceModule;
    threePool = _threePool;
    token = _token;
    staking = _staking;
    // threeXBatchProcessing is needed to get the mint- / redeemBatchTokens
    IThreeXBatchProcessing threeXBatchProcessing = IThreeXBatchProcessing(
      _getContract(keccak256("ThreeXBatchProcessing"))
    );
    mintBatchTokens = threeXBatchProcessing.mintBatchTokens();
    redeemBatchTokens = threeXBatchProcessing.redeemBatchTokens();
  }

  /* ========== PUBLIC FUNCTIONS ========== */
  function mint(
    uint256 _amount,
    uint256 _minMintAmount,
    bool _stake
  ) external {
    mint(_amount, 1, 1, _minMintAmount, _stake);
  }

  function mint(
    uint256 _amount,
    int128 _fromIndex,
    int128 _toIndex,
    uint256 _minMintAmount,
    bool _stake
  ) public {
    token[uint256(uint128(_fromIndex))].safeTransferFrom(msg.sender, address(this), _amount);

    IThreeXBatchProcessing threeXBatchProcessing = IThreeXBatchProcessing(
      _getContract(keccak256("ThreeXBatchProcessing"))
    );

    uint256 stableAmount = _amount;

    if (_fromIndex != _toIndex) {
      stableAmount = _swapStables(_fromIndex, _toIndex, _amount);
    }

    uint256 mintedAmount = _mint(stableAmount, _minMintAmount, threeXBatchProcessing);
    require(mintedAmount >= _minMintAmount, "slippage too high");

    if (_stake) {
      staking.stakeFor(mintedAmount, msg.sender);
    } else {
      mintBatchTokens.targetToken.safeTransfer(msg.sender, mintedAmount);
    }
  }

  function redeem(uint256 _amount, uint256 _minRedeemAmount) external {
    return redeem(_amount, 1, 1, _minRedeemAmount);
  }

  function redeem(
    uint256 _amount,
    int128 _fromIndex,
    int128 _toIndex,
    uint256 _minRedeemAmount
  ) public {
    IThreeXBatchProcessing threeXBatchProcessing = IThreeXBatchProcessing(
      _getContract(keccak256("ThreeXBatchProcessing"))
    );
    BatchTokens memory redeemBatchTokens = threeXBatchProcessing.redeemBatchTokens();

    redeemBatchTokens.sourceToken.safeTransferFrom(msg.sender, address(this), _amount);

    uint256 redeemedAmount = _redeem(_amount, _minRedeemAmount, threeXBatchProcessing);

    if (_fromIndex != _toIndex) {
      redeemedAmount = _swapStables(_fromIndex, _toIndex, redeemedAmount);
    }

    require(redeemedAmount >= _minRedeemAmount, "slippage too high");

    token[uint256(uint128(_toIndex))].safeTransfer(msg.sender, redeemedAmount);
  }

  function setApprovals() external {
    IThreeXBatchProcessing threeXBatchProcessing = IThreeXBatchProcessing(
      _getContract(keccak256("ThreeXBatchProcessing"))
    );

    (address[] memory yToken, ) = basicIssuanceModule.getRequiredComponentUnitsForIssue(
      ISetToken(address(mintBatchTokens.targetToken)),
      1e18
    );

    for (uint256 i; i < yToken.length; i++) {
      ComponentDependencies memory componentDependency = threeXBatchProcessing.componentDependencies(yToken[i]);
      IERC20 lpToken = componentDependency.lpToken;
      CurveMetapool curveMetapool = componentDependency.curveMetaPool;
      IERC20 swapToken = threeXBatchProcessing.swapToken();

      if (i == 0) {
        mintBatchTokens.sourceToken.safeApprove(address(curveMetapool), 0);
        mintBatchTokens.sourceToken.safeApprove(address(curveMetapool), type(uint256).max);

        lpToken.safeApprove(address(componentDependency.utilityPool), 0);
        lpToken.safeApprove(address(componentDependency.utilityPool), type(uint256).max);
      } else {
        mintBatchTokens.sourceToken.safeApprove(address(componentDependency.angleRouter), 0);
        mintBatchTokens.sourceToken.safeApprove(address(componentDependency.angleRouter), type(uint256).max);

        swapToken.safeApprove(address(componentDependency.angleRouter), 0);
        swapToken.safeApprove(address(componentDependency.angleRouter), type(uint256).max);

        swapToken.safeApprove(address(curveMetapool), 0);
        swapToken.safeApprove(address(curveMetapool), type(uint256).max);
      }

      lpToken.safeApprove(yToken[i], 0);
      lpToken.safeApprove(yToken[i], type(uint256).max);

      lpToken.safeApprove(address(curveMetapool), 0);
      lpToken.safeApprove(address(curveMetapool), type(uint256).max);
    }

    // Iterate over all 3 coins in ThreePool [DAI, USDC, USDT]
    for (uint256 i; i < 3; i++) {
      IERC20(threePool.coins(i)).safeApprove(address(threePool), 0);
      IERC20(threePool.coins(i)).safeApprove(address(threePool), type(uint256).max);
    }

    mintBatchTokens.sourceToken.safeApprove(address(threeXBatchProcessing), 0);
    mintBatchTokens.sourceToken.safeApprove(address(threeXBatchProcessing), type(uint256).max);

    mintBatchTokens.targetToken.safeApprove(address(staking), 0);
    mintBatchTokens.targetToken.safeApprove(address(staking), type(uint256).max);

    redeemBatchTokens.sourceToken.safeApprove(address(threeXBatchProcessing), 0);
    redeemBatchTokens.sourceToken.safeApprove(address(threeXBatchProcessing), type(uint256).max);
  }

  /* ========== PRIVATE FUNCTIONS ========== */

  function _mint(
    uint256 _amount,
    uint256 _minMintAmount,
    IThreeXBatchProcessing _threeXBatchProcessing
  ) internal returns (uint256 setTokenAmountAfterFees) {
    // Get the quantity of yToken for one 3X
    (address[] memory tokenAddresses, uint256[] memory quantities) = basicIssuanceModule
      .getRequiredComponentUnitsForIssue(ISetToken(address(mintBatchTokens.targetToken)), 1e18);

    uint256 setValue = _threeXBatchProcessing.valueOfComponents(tokenAddresses, quantities);

    if (
      _minMintAmount >=
      _threeXBatchProcessing.getMinAmountToMint(_amount * 1e12, setValue, _threeXBatchProcessing.slippage().mintBps)
    ) {
      // User wants less or equal slippage to the default setting for batchprocessing
      setTokenAmountAfterFees = _runBatchDepositMintClaim(_amount, _threeXBatchProcessing);
    } else {
      // User accepts more slippage than they would get in batchprocessing to expedite their mint
      setTokenAmountAfterFees = _runPersonalMint(
        _amount,
        _minMintAmount,
        _threeXBatchProcessing,
        tokenAddresses,
        quantities,
        setValue
      );
    }
    emit Minted(_amount, setTokenAmountAfterFees);
  }

  function _runBatchDepositMintClaim(uint256 _amount, IThreeXBatchProcessing _threeXBatchProcessing)
    internal
    returns (uint256 setTokenAmountAfterFees)
  {
    // Use _threeXBatchProcessing for deposit into batch, run batchMint, claim on behalf of user, return result of the claim in setTokenAmountAfterFees
    bytes32 batchId = _threeXBatchProcessing.currentMintBatchId();

    _threeXBatchProcessing.depositForMint(_amount, address(this));

    _threeXBatchProcessing.batchMint();

    setTokenAmountAfterFees = _threeXBatchProcessing.claim(batchId, address(this));
  }

  function _runPersonalMint(
    uint256 _amount,
    uint256 _minMintAmount,
    IThreeXBatchProcessing _threeXBatchProcessing,
    address[] memory _tokenAddresses,
    uint256[] memory _quantities,
    uint256 _setValue
  ) internal returns (uint256 setTokenAmountAfterFees) {
    // Remaining amount of USDC in this batch which hasnt been allocated yet
    uint256 remainingBatchBalanceValue = _amount;

    // Temporary allocation of USDC to be deployed in curveMetapools
    uint256[] memory poolAllocations = new uint256[](_quantities.length);

    uint256[] memory ratios = new uint256[](_quantities.length);

    for (uint256 i; i < _tokenAddresses.length; i++) {
      // prettier-ignore
      ( poolAllocations[i],  ratios[i]) = _getPoolAllocationAndRatio(_tokenAddresses[i], _quantities[i], _amount, _setValue, i, _threeXBatchProcessing);

      remainingBatchBalanceValue -= poolAllocations[i];
    }

    for (uint256 i; i < _tokenAddresses.length; i++) {
      ComponentDependencies memory componentDependency = _threeXBatchProcessing.componentDependencies(
        _tokenAddresses[i]
      );
      uint256 poolAllocation;

      if (remainingBatchBalanceValue > 0) {
        poolAllocation = _getPoolAllocation(remainingBatchBalanceValue, ratios[i]);
      }

      //Pool USDC to get crvLPToken via the swapPools
      _sendToCurve(poolAllocation + poolAllocations[i], componentDependency, i, _threeXBatchProcessing);

      //Deposit crvLPToken to get yToken
      _sendToYearn(componentDependency.lpToken.balanceOf(address(this)), IVault(_tokenAddresses[i]));

      //Approve yToken for minting
      IVault(_tokenAddresses[i]).safeIncreaseAllowance(
        address(basicIssuanceModule),
        IVault(_tokenAddresses[i]).balanceOf(address(this))
      );
    }

    //Get the minimum amount of 3X that we can mint with our balances of yToken
    uint256 setTokenAmount = (IVault(_tokenAddresses[0]).balanceOf(address(this)) * 1e18) / _quantities[0];

    for (uint256 i = 1; i < _tokenAddresses.length; i++) {
      setTokenAmount = Math.min(
        setTokenAmount,
        (IVault(_tokenAddresses[i]).balanceOf(address(this)) * 1e18) / _quantities[i]
      );
    }

    setTokenAmountAfterFees = _takeFee(
      "mint",
      setTokenAmount - _minMintAmount,
      setTokenAmount,
      mintBatchTokens.targetToken
    );

    //Mint 3X
    basicIssuanceModule.issue(ISetToken(address(mintBatchTokens.targetToken)), setTokenAmount, address(this));
  }

  function _redeem(
    uint256 _amount,
    uint256 _minRedeemAmount,
    IThreeXBatchProcessing _threeXBatchProcessing
  ) internal returns (uint256 claimableTokenBalanceAfterFees) {
    //Get tokenAddresses for mapping of underlying
    (address[] memory tokenAddresses, uint256[] memory quantities) = basicIssuanceModule
      .getRequiredComponentUnitsForIssue(ISetToken(address(redeemBatchTokens.sourceToken)), _amount);
    uint256 setValue = _threeXBatchProcessing.valueOfComponents(tokenAddresses, quantities);

    if (
      _minRedeemAmount >=
      _threeXBatchProcessing.getMinAmountFromRedeem(setValue, _threeXBatchProcessing.slippage().redeemBps)
    ) {
      // User wants less or equal slippage to the default setting for batchprocessing
      claimableTokenBalanceAfterFees = _runDepositRedeemClaim(_amount, _threeXBatchProcessing);
    } else {
      // User accepts more slippage than they would get in batchprocessing to expedite the process
      claimableTokenBalanceAfterFees = _runPersonalRedeem(
        _amount,
        _minRedeemAmount,
        _threeXBatchProcessing,
        tokenAddresses
      );
    }

    emit Redeemed(_amount, claimableTokenBalanceAfterFees);
  }

  function _runDepositRedeemClaim(uint256 _amount, IThreeXBatchProcessing _threeXBatchProcessing)
    internal
    returns (uint256 stableAmountAfterFees)
  {
    // Use _threeXBatchProcessing for deposit into batch, run batchRedeem, claim on behalf of user, return result of the claim in setTokenAmountAfterFees
    bytes32 batchId = _threeXBatchProcessing.currentRedeemBatchId();

    _threeXBatchProcessing.depositForRedeem(_amount);
    _threeXBatchProcessing.batchRedeem();

    stableAmountAfterFees = _threeXBatchProcessing.claim(batchId, address(this));
  }

  function _runPersonalRedeem(
    uint256 _amount,
    uint256 _minRedeemAmount,
    IThreeXBatchProcessing _threeXBatchProcessing,
    address[] memory _tokenAddresses
  ) internal returns (uint256 claimableTokenBalanceAfterFees) {
    //Allow setBasicIssuanceModule to use 3X
    _setBasicIssuanceModuleAllowance(_amount);

    //Redeem 3X for yToken
    basicIssuanceModule.redeem(ISetToken(address(redeemBatchTokens.sourceToken)), _amount, address(this));

    for (uint256 i; i < _tokenAddresses.length; i++) {
      ComponentDependencies memory componentDependency = _threeXBatchProcessing.componentDependencies(
        _tokenAddresses[i]
      );
      //Deposit yToken to receive crvLPToken
      _withdrawFromYearn(IVault(_tokenAddresses[i]).balanceOf(address(this)), IVault(_tokenAddresses[i]));

      //Deposit crvLPToken to receive USDC
      _withdrawFromCurve(
        componentDependency.lpToken.balanceOf(address(this)),
        componentDependency,
        i,
        _threeXBatchProcessing
      );
    }

    uint256 claimableTokenBalance = redeemBatchTokens.targetToken.balanceOf(address(this)) - fees["redeem"].accumulated;

    claimableTokenBalanceAfterFees = _takeFee(
      "redeem",
      claimableTokenBalance - _minRedeemAmount,
      claimableTokenBalance,
      redeemBatchTokens.targetToken
    );
  }

  function _swapStables(
    int128 _fromIndex,
    int128 _toIndex,
    uint256 _inputAmount
  ) internal returns (uint256) {
    threePool.exchange(_fromIndex, _toIndex, _inputAmount, 0);

    return token[uint256(uint128(_toIndex))].balanceOf(address(this));
  }

  function _setBasicIssuanceModuleAllowance(uint256 _amount) internal {
    redeemBatchTokens.sourceToken.safeApprove(address(basicIssuanceModule), 0);
    redeemBatchTokens.sourceToken.safeApprove(address(basicIssuanceModule), _amount);
  }

  function _getPoolAllocationAndRatio(
    address _component,
    uint256 _quantity,
    uint256 _suppliedTokenBalance,
    uint256 _setValue,
    uint256 _i,
    IThreeXBatchProcessing _threeXBatchProcessing
  ) internal view returns (uint256 poolAllocation, uint256 ratio) {
    ComponentDependencies memory componentDependency = _threeXBatchProcessing.componentDependencies(_component);

    uint256 lpTokenPriceInUSD = _i == 0
      ? componentDependency.curveMetaPool.get_virtual_price()
      : (componentDependency.curveMetaPool.get_virtual_price() * (2e18 - componentDependency.oracle.read())) / 1e18;
    // Calculate the virtualPrice of one yToken
    uint256 componentValuePerShare = (IVault(_component).pricePerShare() * lpTokenPriceInUSD) / 1e18;

    //Calculate the value of quantity (of yToken) in virtualPrice
    uint256 componentValuePerSet = (_quantity * componentValuePerShare) / 1e18;

    //Calculate the value of leftover yToken in virtualPrice
    uint256 componentValueHeldByContract = (IVault(_component).balanceOf(address(this)) * componentValuePerShare) /
      1e18;

    ratio = (componentValuePerSet * 1e18) / _setValue;
    poolAllocation = _getPoolAllocation(_suppliedTokenBalance, ratio) - (componentValueHeldByContract / 1e12);
    return (poolAllocation, ratio);
  }

  /**
   * @notice returns the amount of USDC that should be allocated for a curveMetapool
   * @param _balance the max amount of USDC that is available in this iteration
   * @param _ratio the ratio of USDC needed to get enough yToken to mint 3X
   */
  function _getPoolAllocation(uint256 _balance, uint256 _ratio) internal pure returns (uint256) {
    return ((_balance * _ratio) / 1e18);
  }

  /**
   * @notice Trade USDC for intermediate swapToken and deposit those into the destination curveMetapool
   * @param _amount The amount of USDC that gets deposited
   * @param _contracts ComponentDependencies (swapPool, curveMetapool and AngleRouter)
   * @param _i index of the component (0 == sUSD, 1 == 3eur)
   * @param _threeXBatchProcessing batchProcessingContract for 3x
   */
  function _sendToCurve(
    uint256 _amount,
    ComponentDependencies memory _contracts,
    uint256 _i,
    IThreeXBatchProcessing _threeXBatchProcessing
  ) internal {
    if (_i == 0) {
      _contracts.curveMetaPool.add_liquidity([0, _amount, 0, 0], 0);
    } else {
      // Trade USDC for intermediate swapToken
      _contracts.angleRouter.mint(
        address(this),
        _amount,
        0,
        address(_threeXBatchProcessing.swapToken()),
        address(mintBatchTokens.sourceToken)
      );
      uint256 destAmount = _threeXBatchProcessing.swapToken().balanceOf(address(this));
      _contracts.curveMetaPool.add_liquidity([destAmount, 0, 0], 0);
    }
  }

  /**
   * @notice Burns crvLPToken to get intermediate swapToken
   * @param _amount The amount of lpTOken that get burned
   * @param _contracts ComponentDependencies (swapPool, curveMetapool and AngleRouter)
   * @param _i index of the component (0 == d3, 1 == 3eur)
   */
  function _withdrawFromCurve(
    uint256 _amount,
    ComponentDependencies memory _contracts,
    uint256 _i,
    IThreeXBatchProcessing _threeXBatchProcessing
  ) internal {
    // Burns lpToken to receive swapToken
    // First argument is the lpToken amount to burn, second is the index of the token we want to receive and third is slippage control

    // Now we trade the swapToken back to USDC
    if (_i == 0) {
      _contracts.utilityPool.remove_liquidity_one_coin(_amount, int128(1), uint256(0), true);
    } else {
      _contracts.curveMetaPool.remove_liquidity_one_coin(_amount, int128(0), uint256(0));
      uint256 amountReceived = _threeXBatchProcessing.swapToken().balanceOf(address(this));
      _contracts.angleRouter.burn(
        address(this),
        amountReceived,
        0,
        address(_threeXBatchProcessing.swapToken()),
        address(redeemBatchTokens.targetToken)
      );
    }
  }

  /**
   * @notice Deposits crvLPToken for yToken
   * @param _amount The amount of crvLPToken that get deposited
   * @param _yearnVault The yearn Vault in which we deposit
   */
  function _sendToYearn(uint256 _amount, IVault _yearnVault) internal {
    // Mints yToken and sends them to msg.sender (this contract)
    _yearnVault.deposit(_amount);
  }

  /**
   * @notice Withdraw crvLPToken from yearn
   * @param _amount The amount of crvLPToken which we deposit
   * @param _yearnVault The yearn Vault in which we deposit
   */
  function _withdrawFromYearn(uint256 _amount, IVault _yearnVault) internal {
    // Takes yToken and sends crvLPToken to this contract
    _yearnVault.withdraw(_amount);
  }

  function _getContract(bytes32 _name) internal view override(ACLAuth, ContractRegistryAccess) returns (address) {
    return super._getContract(_name);
  }
}
