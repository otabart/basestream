// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StreamingSubscription {
    mapping(address => Subscription) public subscriptions;
    uint256 public subscriptionPrice = 0.01 ether;
    address public owner;

    struct Subscription {
        bool isActive;
        uint256 startTime;
        uint256 endTime;
    }

    event NewSubscription(address indexed subscriber, uint256 startTime, uint256 endTime);
    event PriceUpdated(uint256 newPrice);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function subscribe() external payable {
        require(msg.value >= subscriptionPrice, "Insufficient payment");
        
        subscriptions[msg.sender] = Subscription({
            isActive: true,
            startTime: block.timestamp,
            endTime: block.timestamp + 30 days
        });

        emit NewSubscription(msg.sender, block.timestamp, block.timestamp + 30 days);
    }

    function isSubscribed(address user) external view returns (bool) {
        return subscriptions[user].isActive && block.timestamp <= subscriptions[user].endTime;
    }

    function updatePrice(uint256 newPrice) external onlyOwner {
        subscriptionPrice = newPrice;
        emit PriceUpdated(newPrice);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}