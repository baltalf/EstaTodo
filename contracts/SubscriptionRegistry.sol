// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SubscriptionRegistry {
    address public owner;
    
    struct Subscription {
        string empresa;
        string plan;
        uint256 amount;
        uint256 startDate;
        uint256 endDate;
        bool active;
        string mpPaymentId;
    }
    
    mapping(string => Subscription) public subscriptions; // email => Subscription
    string[] public subscribers;
    
    event SubscriptionCreated(
        string email,
        string empresa,
        string plan,
        uint256 amount,
        string mpPaymentId
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function registerSubscription(
        string memory email,
        string memory empresa,
        string memory plan,
        uint256 amount,
        string memory mpPaymentId
    ) public onlyOwner {
        subscriptions[email] = Subscription({
            empresa: empresa,
            plan: plan,
            amount: amount,
            startDate: block.timestamp,
            endDate: block.timestamp + 30 days,
            active: true,
            mpPaymentId: mpPaymentId
        });
        subscribers.push(email);
        
        emit SubscriptionCreated(email, empresa, plan, amount, mpPaymentId);
    }
    
    function isActive(string memory email) public view returns (bool) {
        return subscriptions[email].active && 
               subscriptions[email].endDate > block.timestamp;
    }
    
    function getSubscription(string memory email) 
        public view returns (Subscription memory) {
        return subscriptions[email];
    }
}
