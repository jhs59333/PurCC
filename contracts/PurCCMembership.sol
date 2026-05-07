// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PurCCMembership
 * @notice 會員機制智能合約 — 普通 / 高級兩種等級，僅針對以太生態系（Ethereum、Base、Arbitrum、Optimism、Polygon、Sepolia 等 EVM 鏈）。
 * @dev 使用原生代幣（ETH / Base ETH / Arb ETH / Optimism ETH / MATIC）支付，避免 ERC-20 approve 流程。
 *      價格以 wei 計價，部署時依目標鏈設定（例：Mainnet 0.01 ETH、L2 0.001 ETH）。
 */
contract PurCCMembership {
    enum Tier { None, Basic, Premium }

    struct Membership {
        Tier tier;
        uint64 expiresAt; // unix timestamp
    }

    address public owner;
    bool public paused;

    // 月費（單位：wei，以原生幣計）
    uint256 public basicMonthlyPrice;
    uint256 public premiumMonthlyPrice;

    // 年付折扣 = price * 12 * (10000 - yearlyDiscountBps) / 10000
    uint16 public yearlyDiscountBps = 3000; // 30% off

    mapping(address => Membership) public memberships;

    event Subscribed(
        address indexed user,
        Tier tier,
        uint256 monthsAdded,
        uint64 newExpiresAt,
        uint256 paid
    );
    event PriceUpdated(uint256 basic, uint256 premium);
    event YearlyDiscountUpdated(uint16 bps);
    event Withdrawn(address indexed to, uint256 amount);
    event PausedSet(bool paused);
    event OwnershipTransferred(address indexed from, address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "PAUSED");
        _;
    }

    constructor(uint256 _basicMonthly, uint256 _premiumMonthly) {
        owner = msg.sender;
        basicMonthlyPrice = _basicMonthly;
        premiumMonthlyPrice = _premiumMonthly;
        emit PriceUpdated(_basicMonthly, _premiumMonthly);
    }

    // ---------- 會員操作 ----------

    /// @notice 訂閱或續訂會員（月付）
    function subscribeMonthly(Tier tier) external payable whenNotPaused {
        _subscribe(tier, 1, false);
    }

    /// @notice 訂閱或續訂會員（年付，享 yearlyDiscountBps 折扣）
    function subscribeYearly(Tier tier) external payable whenNotPaused {
        _subscribe(tier, 12, true);
    }

    /// @notice 自訂月數續訂
    function subscribeMonths(Tier tier, uint8 months) external payable whenNotPaused {
        require(months > 0 && months <= 24, "BAD_MONTHS");
        _subscribe(tier, months, false);
    }

    function _subscribe(Tier tier, uint8 months, bool yearly) internal {
        require(tier == Tier.Basic || tier == Tier.Premium, "BAD_TIER");
        uint256 price = _quote(tier, months, yearly);
        require(msg.value >= price, "INSUFFICIENT_FEE");

        Membership storage m = memberships[msg.sender];
        // 升級時若到期日未過、tier 不同，從現在重新計算
        uint64 base = (m.expiresAt > block.timestamp && m.tier == tier)
            ? m.expiresAt
            : uint64(block.timestamp);
        uint64 newExpires = base + uint64(uint256(months) * 30 days);

        m.tier = tier;
        m.expiresAt = newExpires;

        // 退還多付
        if (msg.value > price) {
            (bool ok, ) = msg.sender.call{value: msg.value - price}("");
            require(ok, "REFUND_FAIL");
        }

        emit Subscribed(msg.sender, tier, months, newExpires, price);
    }

    // ---------- 查詢 ----------

    function quote(Tier tier, uint8 months, bool yearly) external view returns (uint256) {
        return _quote(tier, months, yearly);
    }

    function _quote(Tier tier, uint8 months, bool yearly) internal view returns (uint256) {
        uint256 monthly = tier == Tier.Premium ? premiumMonthlyPrice : basicMonthlyPrice;
        uint256 raw = monthly * months;
        if (yearly && months == 12) {
            return (raw * (10000 - yearlyDiscountBps)) / 10000;
        }
        return raw;
    }

    function isActive(address user) external view returns (bool) {
        Membership memory m = memberships[user];
        return m.tier != Tier.None && m.expiresAt > block.timestamp;
    }

    function tierOf(address user) external view returns (Tier) {
        Membership memory m = memberships[user];
        if (m.expiresAt <= block.timestamp) return Tier.None;
        return m.tier;
    }

    // ---------- Owner ----------

    function setPrices(uint256 _basic, uint256 _premium) external onlyOwner {
        basicMonthlyPrice = _basic;
        premiumMonthlyPrice = _premium;
        emit PriceUpdated(_basic, _premium);
    }

    function setYearlyDiscountBps(uint16 bps) external onlyOwner {
        require(bps <= 9000, "TOO_HIGH");
        yearlyDiscountBps = bps;
        emit YearlyDiscountUpdated(bps);
    }

    function setPaused(bool p) external onlyOwner {
        paused = p;
        emit PausedSet(p);
    }

    function withdraw(address payable to) external onlyOwner {
        uint256 bal = address(this).balance;
        (bool ok, ) = to.call{value: bal}("");
        require(ok, "WITHDRAW_FAIL");
        emit Withdrawn(to, bal);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
