# PurCC Membership Smart Contract

針對以太生態系（Ethereum L1 + L2）打造的會員訂閱合約，支援 **Basic / Premium** 兩種等級。

## 特點
- **原生幣支付**：ETH（Mainnet / Sepolia / Base / Arbitrum / Optimism）或 MATIC（Polygon），免 ERC-20 approve。
- **彈性週期**：月付、年付（享 30% 折扣）、自訂 1–24 月。
- **同 tier 續訂**：到期日累加；升級到不同 tier 則從當下重新計算。
- **Owner 控制**：價格、折扣、暫停、提款、轉移所有權。
- **安全機制**：ReentrancyGuard 模式（withdraw / refund 走 `call`），`whenNotPaused` 守門。

## 部署

### 1. 環境
建議使用 [Foundry](https://book.getfoundry.sh/)：
```bash
forge init purcc-membership && cd purcc-membership
cp ../contracts/PurCCMembership.sol src/
forge build
```

### 2. 設定價格（依目標鏈調整）
| 鏈 | Basic / 月 | Premium / 月 |
|----|-----------|--------------|
| Ethereum Mainnet | 0.003 ETH | 0.008 ETH |
| Base / Arbitrum / Optimism | 0.001 ETH | 0.003 ETH |
| Polygon | 8 MATIC | 20 MATIC |
| Sepolia (測試) | 0.001 ETH | 0.003 ETH |

### 3. 部署指令
```bash
forge create src/PurCCMembership.sol:PurCCMembership \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args 1000000000000000 3000000000000000   # 0.001 / 0.003 ETH
```

### 4. 驗證
```bash
forge verify-contract <ADDR> src/PurCCMembership.sol:PurCCMembership \
  --chain-id 8453 --etherscan-api-key $BASESCAN_KEY
```

## 前端整合
合約地址填入 `src/lib/contract.ts` 的 `MEMBERSHIP_CONTRACTS` 對應 chainId，前端會自動依使用者錢包的鏈讀取。

## 函式總覽
| 函式 | 說明 |
|------|------|
| `subscribeMonthly(tier)` payable | 月訂閱 |
| `subscribeYearly(tier)` payable | 年訂閱（30% off） |
| `subscribeMonths(tier, months)` payable | 自訂月數 |
| `quote(tier, months, yearly)` view | 查詢應付金額 |
| `isActive(user)` view | 是否仍在效期 |
| `tierOf(user)` view | 當前 tier（過期回傳 None） |

## 安全注意事項
- 部署前請使用 Slither / Mythril / Foundry fuzzing 自動化檢測。
- 上 Mainnet 前建議第三方 Audit。
- Owner 私鑰請使用多簽（Safe）。
