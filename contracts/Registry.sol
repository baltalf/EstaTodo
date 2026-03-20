// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Registry {
    address public owner;
    mapping(address => bool) public allowlist;

    struct EventData {
        string cameraId;
        uint256 timestamp;
        string hashSha256;
        string eventType;
    }

    mapping(string => EventData) private eventsByHash;

    event LogEvent(
        string cameraId,
        uint256 timestamp,
        string hashSha256,
        string eventType
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyAllowlist() {
        require(allowlist[msg.sender] || msg.sender == owner, "Caller not in allowlist");
        _;
    }

    constructor() {
        owner = msg.sender;
        allowlist[msg.sender] = true;
    }

    function addToAllowlist(address _addr) public onlyOwner {
        allowlist[_addr] = true;
    }

    function removeFromAllowlist(address _addr) public onlyOwner {
        allowlist[_addr] = false;
    }

    function store(
        string memory cameraId,
        uint256 timestamp,
        string memory hashSha256,
        string memory eventType
    ) public onlyAllowlist {
        require(bytes(hashSha256).length > 0, "Hash cannot be empty");
        require(bytes(eventsByHash[hashSha256].hashSha256).length == 0, "Event already exists");

        eventsByHash[hashSha256] = EventData({
            cameraId: cameraId,
            timestamp: timestamp,
            hashSha256: hashSha256,
            eventType: eventType
        });

        emit LogEvent(cameraId, timestamp, hashSha256, eventType);
    }

    function verify(string memory hashSha256) public view returns (bool) {
        return bytes(eventsByHash[hashSha256].hashSha256).length > 0;
    }

    function getEvent(string memory hashSha256)
        public
        view
        returns (
            string memory,
            uint256,
            string memory,
            string memory
        )
    {
        require(verify(hashSha256), "Event not found");
        EventData memory e = eventsByHash[hashSha256];
        return (e.cameraId, e.timestamp, e.hashSha256, e.eventType);
    }
}
