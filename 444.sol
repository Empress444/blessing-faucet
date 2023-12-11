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
//   bless up, anon
//   official: x.com/444token

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FourFourtyFourToken is ERC20, Ownable {
    // Constructor: Mint initial supply to the contract deployer
    constructor() ERC20("444", "444") Ownable(msg.sender) {
        uint256 initialSupply = 444444444444 * 1e18; // 444,444,444,444 tokens with 18 decimals
        _mint(msg.sender, initialSupply);
    }

    // Function to renounce the contract ownership
    function renounceContract() external onlyOwner {
        renounceOwnership();
    }
}
