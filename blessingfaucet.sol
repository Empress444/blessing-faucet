// SPDX-License-Identifier: MIT
//
//         :::         :::         :::
//       :+:         :+:         :+:
//     +:+ +:+     +:+ +:+     +:+ +:+
//   +#+  +:+    +#+  +:+    +#+  +:+
// +#+#+#+#+#+ +#+#+#+#+#+ +#+#+#+#+#+
//      #+#         #+#         #+#
//     ###         ###         ###
//
//   $444 Blessing Faucet
//   Request a Blessing once per 24 hours
//
//   bless up, anon
//
//   official: x.com/444token

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

contract BlessingFaucet {
    // Token contract address
    address public tokenAddress;

    // $444 Token contract address
    address public requiredTokenAddress =
        0x017557194713D864367e1F217cFBCf0470247B23;

    // Administrator address (you)
    address public admin;

    // Amount of tokens given out in each blessing
    uint256 public blessingAmount;

    // Timestamp of the last blessing for each user
    mapping(address => uint256) public lastBlessingTime;

    // Event emitted when a user claims a blessing
    event BlessingClaimed(address indexed user, uint256 amount);

    // Event emitted when the blessing amount is changed
    event BlessingAmountChanged(uint256 newAmount);

    // Modifier to ensure that only the administrator can execute certain functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor(address _tokenAddress) {
        admin = msg.sender;
        tokenAddress = _tokenAddress;
        blessingAmount = 444;
    }

    // Function to deposit tokens into the contract
    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than 0");

        // Transfer tokens from the sender to the contract
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
    }

    // Function for users to claim blessings
    function claimBlessing() external {
        require(
            block.timestamp - lastBlessingTime[msg.sender] >= 24 hours,
            "Can only claim once every 24 hours"
        );

        // Check if the user has at least 1 $444 token
        require(
            IERC20(requiredTokenAddress).balanceOf(msg.sender) >= 1,
            "Must hold at least 1 $444 token"
        );

        // Update last blessing time
        lastBlessingTime[msg.sender] = block.timestamp;

        // Transfer tokens to the user
        IERC20(tokenAddress).transfer(msg.sender, blessingAmount);

        // Emit event
        emit BlessingClaimed(msg.sender, blessingAmount);
    }

    // Function to change the amount of tokens given out in each blessing
    function changeBlessingAmount(uint256 newAmount) external onlyAdmin {
        require(newAmount > 0, "Blessing amount must be greater than 0");

        // Update blessing amount
        blessingAmount = newAmount;

        // Emit event
        emit BlessingAmountChanged(newAmount);
    }
}
