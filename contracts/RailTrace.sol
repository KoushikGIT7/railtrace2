// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RailTrace {
	enum Status { Registered, Received, Installed, Inspected, Retired }

	struct HistoryEvent {
		Status status;
		uint256 timestamp;
		string metadata; // JSON string with flexible fields
	}

	mapping(bytes32 => HistoryEvent[]) private partHistory;

	event Registered(bytes32 indexed partHash, string metadata, uint256 timestamp);
	event Received(bytes32 indexed partHash, string metadata, uint256 timestamp);
	event Installed(bytes32 indexed partHash, string metadata, uint256 timestamp);
	event Inspected(bytes32 indexed partHash, string metadata, uint256 timestamp);
	event Retired(bytes32 indexed partHash, string metadata, uint256 timestamp);

	function registerPart(bytes32 partHash, string calldata metadata) external {
		_append(partHash, Status.Registered, metadata);
		emit Registered(partHash, metadata, block.timestamp);
	}

	function receivePart(bytes32 partHash, string calldata metadata) external {
		_append(partHash, Status.Received, metadata);
		emit Received(partHash, metadata, block.timestamp);
	}

	function installPart(bytes32 partHash, string calldata metadata) external {
		_append(partHash, Status.Installed, metadata);
		emit Installed(partHash, metadata, block.timestamp);
	}

	function inspectPart(bytes32 partHash, string calldata metadata) external {
		_append(partHash, Status.Inspected, metadata);
		emit Inspected(partHash, metadata, block.timestamp);
	}

	function retirePart(bytes32 partHash, string calldata metadata) external {
		_append(partHash, Status.Retired, metadata);
		emit Retired(partHash, metadata, block.timestamp);
	}

	function getPartHistory(bytes32 partHash) external view returns (HistoryEvent[] memory) {
		return partHistory[partHash];
	}

	function _append(bytes32 partHash, Status status, string calldata metadata) internal {
		partHistory[partHash].push(HistoryEvent({
			status: status,
			timestamp: block.timestamp,
			metadata: metadata
		}));
	}
}
