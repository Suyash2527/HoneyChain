// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title HoneyChain - honey batch traceability for a permissioned (PoA) network.
/// Only hashes and small attestations live on-chain; lab PDFs sit on IPFS and
/// IoT telemetry stays off-chain, anchored via a Merkle root.
contract HoneyChain {
    enum Role { None, Beekeeper, Lab, Processor, Retailer, Regulator }
    enum Status { Harvested, Certified, Rejected, Packed }

    struct Batch {
        string batchId;
        address beekeeper;
        uint256 quantityGrams;
        uint64 harvestedAt;
        bytes32 hiveSetHash;     // hash of hive IDs used
        bytes32 telemetryRoot;   // Merkle root of IoT readings
        bytes32 labReportHash;   // hash of lab report (PDF on IPFS)
        Status status;
        address currentCustodian;
    }

    address public admin;                       // KVIC governance multisig in production
    mapping(address => Role) public roles;
    mapping(bytes32 => Batch) private batches;  // keccak256(batchId) => batch
    mapping(bytes32 => address[]) private custodyTrail;

    event RoleGranted(address indexed account, Role role);
    event HarvestLogged(bytes32 indexed key, string batchId, address indexed beekeeper);
    event TelemetryAnchored(bytes32 indexed key, bytes32 merkleRoot);
    event LabResult(bytes32 indexed key, bool pass, bytes32 reportHash);
    event CustodyTransferred(bytes32 indexed key, address indexed from, address indexed to);

    modifier onlyRole(Role r) {
        require(roles[msg.sender] == r, "not authorised");
        _;
    }

    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Regulator;
    }

    function grantRole(address account, Role role) external {
        require(msg.sender == admin, "admin only");
        roles[account] = role;
        emit RoleGranted(account, role);
    }

    function logHarvest(string calldata batchId, uint256 quantityGrams, bytes32 hiveSetHash)
        external onlyRole(Role.Beekeeper)
    {
        bytes32 key = keccak256(bytes(batchId));
        require(batches[key].harvestedAt == 0, "batch exists");
        batches[key] = Batch(batchId, msg.sender, quantityGrams, uint64(block.timestamp), hiveSetHash, bytes32(0), bytes32(0), Status.Harvested, msg.sender);
        custodyTrail[key].push(msg.sender);
        emit HarvestLogged(key, batchId, msg.sender);
    }

    function anchorTelemetry(string calldata batchId, bytes32 merkleRoot) external onlyRole(Role.Beekeeper) {
        bytes32 key = keccak256(bytes(batchId));
        require(batches[key].beekeeper == msg.sender, "not your batch");
        batches[key].telemetryRoot = merkleRoot;
        emit TelemetryAnchored(key, merkleRoot);
    }

    /// Verdict is supplied by the accredited lab; a FAIL is permanent and cannot be overwritten.
    function certify(string calldata batchId, bool pass, bytes32 reportHash) external onlyRole(Role.Lab) {
        bytes32 key = keccak256(bytes(batchId));
        Batch storage b = batches[key];
        require(b.harvestedAt != 0, "unknown batch");
        require(b.status == Status.Harvested, "already assessed");
        b.labReportHash = reportHash;
        b.status = pass ? Status.Certified : Status.Rejected;
        emit LabResult(key, pass, reportHash);
    }

    function transferCustody(string calldata batchId, address to) external {
        bytes32 key = keccak256(bytes(batchId));
        Batch storage b = batches[key];
        require(b.currentCustodian == msg.sender, "not custodian");
        require(b.status != Status.Rejected, "rejected batch cannot move");
        require(roles[to] == Role.Processor || roles[to] == Role.Retailer, "bad recipient");
        b.currentCustodian = to;
        custodyTrail[key].push(to);
        if (roles[to] == Role.Retailer) b.status = Status.Packed;
        emit CustodyTransferred(key, msg.sender, to);
    }

    function getBatch(string calldata batchId) external view returns (Batch memory, address[] memory trail) {
        bytes32 key = keccak256(bytes(batchId));
        return (batches[key], custodyTrail[key]);
    }
}
