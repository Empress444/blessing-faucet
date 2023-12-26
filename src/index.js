let contract;
let account;
let web3;
let isDropdownOpen = false;
let isDropdownHovered = false;

import detectEthereumProvider from '@metamask/detect-provider';
import contractAbi from './ContractAbi';
import Web3 from 'web3';

// Add the handleDropdownItemClick function
function handleDropdownItemClick(item) {
  if (item === 'Item 1') {
    window.open('https://app.uniswap.org/tokens/optimism/0x017557194713d864367e1f217cfbcf0470247b23', '_blank');
  } else if (item === 'Item 2') {
    window.open('https://www.dextools.io/app/en/optimism/pair-explorer/0x9ca6dcaabab451e1bd235c965085811472b27a8c', '_blank');
  } else if (item === 'Item 3') {
    addCustomTokenToMetaMask('0x017557194713D864367e1F217cFBCf0470247B23');
  }
  // Add more conditions for other items if needed
}

// Add the hideDropdown function
function hideDropdown() {
  const dropdownContent = document.getElementById('dropdownContent');
  dropdownContent.style.display = 'none';
}

window.connectWallet = async function connectWallet() {
  try {
    const provider = await detectEthereumProvider();

    if (provider) {
      await startApp(provider);
    } else {
      console.log('Please install MetaMask!');
    }
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
  }
};

window.toggleDropdown = function toggleDropdown() {
  const dropdownContent = document.getElementById('dropdownContent');
  isDropdownOpen = !isDropdownOpen;
  dropdownContent.style.display = isDropdownOpen ? 'block' : 'none';

  // If the dropdown is open, set a flag to indicate that it's being hovered
  if (isDropdownOpen) {
    isDropdownHovered = true;
  }
};

// Add a new mouseenter event listener for the dropdown content
document.getElementById('dropdownContent').addEventListener("mouseenter", function () {
  // Set the flag to indicate that the dropdown is being hovered
  isDropdownHovered = true;
});

// Add a new mouseleave event listener for the dropdown button
document.querySelector('.tokenButton').addEventListener("mouseleave", function () {
  // If the dropdown is open and not being hovered, display it
  if (isDropdownOpen && !isDropdownHovered) {
    const dropdownContent = document.getElementById('dropdownContent');
    dropdownContent.style.display = 'block';
  }
});

// Update the existing mouseleave event listener for the dropdown content
document.getElementById('dropdownContent').addEventListener("mouseleave", function () {
  // Set the flag to indicate that the dropdown is not being hovered
  isDropdownHovered = false;
  hideDropdown();
});

// Add a new mouseenter event listener for the dropdown button
document.querySelector('.tokenButton').addEventListener("mouseenter", function () {
  // If the dropdown is open and not being hovered, display it
  if (document.getElementById('dropdownContent').style.display === 'block' && !isDropdownHovered) {
    const dropdownContent = document.getElementById('dropdownContent');
    dropdownContent.style.display = 'block';
  }
});

async function startApp(provider) {
  if (provider !== window.ethereum) {
    console.error('Do you have multiple wallets installed?');
  } else {
    // Initialize web3 once
    web3 = new Web3(window.ethereum);
    await getAccount();
  }
}

async function getAccount() {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0];
    document.querySelector('.showAccount').innerHTML = account;

    // Call the function to get total claims
    await getTotalClaims(account);

    // Call the function to get last claim timestamp
    const lastClaimTimestamp = await getLastClaimTimestamp(account);

    // Display the claim status based on the last claim timestamp
    displayClaimStatus(lastClaimTimestamp);

    // Call the function to get total referral bonuses
    await getTotalReferralBonuses(account);

    const referralAddress = document.getElementById('referralInput').value;

    // Check if a referral address is provided before calling claimBlessing
    if (referralAddress) {
      await claimBlessing(referralAddress);
    }
  } catch (error) {
    if (error.code === 4001) {
      console.log('User denied account access or did not connect to MetaMask.');
    } else {
      console.error('Error getting account:', error);
    }
  }
}

window.claimBlessing = async function claimBlessing() {
  try {
    // Get the user's selected address
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];

    // Request account access if not already granted
    if (!userAddress) {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || !accounts.length) {
        console.log('User denied account access.');
        return;
      }
    }

    // Get referral address from the input field
    const referralAddressInput = document.getElementById('referralInput');
    let referralAddress = referralAddressInput.value.trim();

    // Check if referral address is blank or invalid, use default address
    if (!referralAddress || !isValidAddress(referralAddress) || referralAddress === userAddress) {
      referralAddress = '0x4444466289f50Cf35Ac39642f1358cBF4bB7Dd53';
    }

    // Estimate gas
    const gasEstimate = await contract.methods.claimBlessing(referralAddress).estimateGas({ from: userAddress });

    console.log('Gas Estimate:', gasEstimate);

    // Send the transaction to claim blessing with the estimated gas
    const result = await contract.methods.claimBlessing(referralAddress).send({
      from: userAddress,
      gas: gasEstimate,
    });

    console.log('Claim Blessing Transaction Result:', result);

    // Fetch and update data after a successful transaction
    await fetchDataForConnectedWallet(userAddress);
    await fetchFaucetStatus();
    await fetchClaimStatus(userAddress);

    // Display success message
    displayMessage('Blessings claimed!', false);

    // Clear any previous error messages
    displayErrorMessage('');
  } catch (error) {
    console.error('Error claiming blessing:', error);

    // Display error message
    const errorMessage = `Transaction Failed: ${error.message || error}`;
    displayMessage(errorMessage, true);

    // Display error message below the claim button
    displayErrorMessage(errorMessage);
  }
};

function displayErrorMessage(message) {
  // Target the error message <div> and update its content
  const errorMessageElement = document.getElementById('errorMessage');
  errorMessageElement.textContent = message;
}

function isValidAddress(address) {
  // Check if the address is a non-empty string
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check if the address is 40 characters long (excluding "0x")
  if (address.length !== 42) {
    return false;
  }

  // Check if the address starts with "0x"
  if (address.slice(0, 2) !== '0x') {
    return false;
  }

  // Check if the remaining characters are valid hexadecimal characters
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (!hexRegex.test(address.slice(2))) {
    return false;
  }

  // If all checks pass, the address is considered valid
  return true;
}

async function getTotalClaims(account) {
  try {
    const contractAddress = '0x87c08d5DeD10bc7939E168Ff10A8B154bb9aAca8';
    contract = new web3.eth.Contract(contractAbi, contractAddress);

    const totalClaims = await contract.methods.getTotalClaims(account).call();
    document.querySelector('.total-claims').innerHTML = ` ${totalClaims}`;
  } catch (error) {
    console.error('Error fetching total claims:', error);
  }
}

function displayClaimStatus(lastClaimTimestamp) {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = lastClaimTimestamp + 24 * 60 * 60 - currentTime;
  const claimStatusElement = document.getElementById('claimStatus');

  if (timeRemaining > 0) {
    displayCountdownTimer(timeRemaining, claimStatusElement);
  } else {
    displayClaimAvailable(claimStatusElement);
  }
}

function displayCountdownTimer(timeRemaining, element) {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const timerString = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  element.innerHTML = `Next Claim in ${timerString}`;
}

function displayClaimAvailable(element) {
  element.innerHTML = '<span style="color: green;">Claim Available</span>';
}

function padZero(number) {
  return number.toString().padStart(2, '0');
}

async function getLastClaimTimestamp(account) {
  try {
    const contractAddress = '0x87c08d5DeD10bc7939E168Ff10A8B154bb9aAca8';
    contract = new web3.eth.Contract(contractAbi, contractAddress);

    const lastClaimTimestampBigInt = await contract.methods.getLastClaimTimestamp(account).call();
    const lastClaimTimestamp = Number(lastClaimTimestampBigInt);

    console.log('Last Claim Timestamp:', lastClaimTimestamp);

    const lastClaimElement = document.querySelector('.last-claim');
    lastClaimElement.textContent = new Date(lastClaimTimestamp * 1000).toLocaleString();
    return lastClaimTimestamp;
  } catch (error) {
    console.error('Error fetching last claim timestamp:', error);
  }
}

async function getTotalReferralBonuses(account) {
  try {
    const contractAddress = '0x87c08d5DeD10bc7939E168Ff10A8B154bb9aAca8';
    contract = new web3.eth.Contract(contractAbi, contractAddress);

    const totalReferralBonusesWei = await contract.methods.getTotalReferralBonuses(account).call();
    const totalReferralBonusesEther = web3.utils.fromWei(totalReferralBonusesWei, 'ether');

    console.log('Total Referral Bonuses (Wei):', totalReferralBonusesWei);
    console.log('Total Referral Bonuses (Ether):', totalReferralBonusesEther);

    document.querySelector('.totalReferralBonuses').innerHTML = `${totalReferralBonusesEther} $444`;
  } catch (error) {
    console.error('Error fetching total referral bonuses:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const claimButton = document.querySelector('.claim-button');

  claimButton.addEventListener('click', async () => {
    claimButton.disabled = true;

    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    } finally {
      claimButton.disabled = false;
    }
  });
});
