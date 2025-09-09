// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

/**
 * @title USDT_OFT
 * @notice Cross-chain USDT token using LayerZero V2 OFT (mint/burn flavor)
 * @dev This contract extends the base OFT contract for cross-chain transfers
 */
contract MyOFT is OFT {
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    
    // Constants
    uint8 public constant DECIMALS = 6;
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**DECIMALS; // 1M USDT initial supply
    
    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {
        // Mint initial supply to delegate (deployer)
        _mint(_delegate, INITIAL_SUPPLY);
        emit TokensMinted(_delegate, INITIAL_SUPPLY);
    }
    
    /**
     * @notice Public mint function for demo purposes (owner only)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external virtual onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @notice Public mint function for anyone (demo purposes)
     * @param amount Amount of tokens to mint
     */
    function mintForSelf(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= 1000 * 10**DECIMALS, "Max 1000 USDT per mint");
        
        _mint(msg.sender, amount);
        emit TokensMinted(msg.sender, amount);
    }
    
    /**
     * @notice Override decimals to return USDT standard (6 decimals)
     */
    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }
}
