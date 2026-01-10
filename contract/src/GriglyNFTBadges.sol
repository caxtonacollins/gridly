// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GridlyNFTBadges
 * @dev NFT badge system for achievement unlocking in Gridly
 */
contract GridlyNFTBadges is ERC721, Ownable {

    uint256 private _tokenIdCounter;

    enum BadgeType {
        FIRST_WIN,
        WEEK_STREAK,
        SPEED_DEMON,
        LEADERBOARD_TOP,
        CENTURY
    }

    struct Badge {
        BadgeType badgeType;
        string name;
        string description;
        string imageURI;
        uint256 mintedCount;
    }

    mapping(uint256 => Badge) public badges;
    mapping(address => mapping(BadgeType => bool)) public userBadges;
    mapping(uint256 => BadgeType) public tokenBadgeType;

    event BadgeMinted(address indexed player, BadgeType indexed badgeType, uint256 tokenId);
    event BadgeRevealed(BadgeType indexed badgeType);

    constructor(address _initialOwner) ERC721("Gridly Badge", "GRIDLYBADGE") Ownable(_initialOwner) {}

    /**
     * @dev Register a new badge type
     */
    function registerBadge(
        BadgeType _type,
        string memory _name,
        string memory _description,
        string memory _imageURI
    ) external onlyOwner {
        badges[uint256(_type)] = Badge({
            badgeType: _type,
            name: _name,
            description: _description,
            imageURI: _imageURI,
            mintedCount: 0
        });
        emit BadgeRevealed(_type);
    }

    /**
     * @dev Mint a badge to a player
     * Called by GridlyGameManager or similar contract
     */
    function mintBadge(address _player, BadgeType _badgeType)
        external
        onlyOwner
        returns (uint256)
    {
        require(_player != address(0), "Invalid player address");
        require(!userBadges[_player][_badgeType], "Player already has this badge");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        userBadges[_player][_badgeType] = true;
        tokenBadgeType[tokenId] = _badgeType;
        badges[uint256(_badgeType)].mintedCount++;

        _safeMint(_player, tokenId);
        emit BadgeMinted(_player, _badgeType, tokenId);

        return tokenId;
    }

    /**
     * @dev Check if player has a badge
     */
    function hasBadge(address _player, BadgeType _badgeType)
        external
        view
        returns (bool)
    {
        return userBadges[_player][_badgeType];
    }

    /**
     * @dev Get badge metadata
     */
    function getBadge(BadgeType _badgeType)
        external
        view
        returns (Badge memory)
    {
        return badges[uint256(_badgeType)];
    }

    /**
     * @dev Standard ERC721 metadata
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);
        BadgeType badgeType = tokenBadgeType[tokenId];
        return badges[uint256(badgeType)].imageURI;
    }
}
