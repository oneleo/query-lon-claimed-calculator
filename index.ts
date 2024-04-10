import * as fs from "fs";

interface Element {
  address: string;
  balance: string;
}

interface PeriodData {
  total_balance: string;
  elements?: Element[];
}

interface TotalClaimed {
  period: string;
  totalBalance: string;
}

interface ClaimedAccount {
  balance: string;
}

const getTokenlonData = (): bigint[] => {
  const totalSums: bigint[] = new Array(20).fill(BigInt(0));

  // Loop through each period JSON file
  for (let i = 0; i <= 20; i++) {
    const periodFileName = `period_${i}.json`;
    const periodFilePath = `tokenlon-data/${periodFileName}`;

    // Check if file exists
    if (fs.existsSync(periodFilePath)) {
      const periodData: PeriodData = JSON.parse(
        fs.readFileSync(periodFilePath, "utf-8")
      );

      // Calculate balance sum
      if (periodData.elements) {
        const periodBalanceSum = periodData.elements.reduce(
          (acc: bigint, curr: Element) => {
            return acc + BigInt(curr.balance);
          },
          BigInt(0)
        );

        // Store balance sum in totalSums array
        totalSums[i] = periodBalanceSum;

        // Update periodData's total_balance field
        periodData.total_balance = periodBalanceSum.toString();
      }
    } else {
      console.log(`File ${periodFileName} not found.`);
    }
  }
  return totalSums;
};

const getSubgraphData = (): bigint[] => {
  try {
    // 讀取 JSON 檔案
    const rawData = fs.readFileSync("subgraph-data/queryTotal.json", "utf-8");
    const jsonData = JSON.parse(rawData);

    // 提取 totalClaimedPerPeriods 數據
    const totalClaimedPerPeriods: TotalClaimed[] =
      jsonData.data.totalClaimedPerPeriods;

    // 創建 claimed 數組
    const claimed: bigint[] = new Array(28).fill(BigInt(0));

    // 將每個 period 的 totalBalance 值存入 claimed 數組中
    totalClaimedPerPeriods.forEach((item) => {
      let period = parseInt(item.period);

      const totalBalance = BigInt(item.totalBalance);

      // 將 period 值為 18446744073709551615 的 totalBalance 加到 claimed[0] 中
      if (period >= Number.MAX_SAFE_INTEGER) {
        period = 0;
      }
      claimed[period] += totalBalance;
    });

    // 返回 claimed 數組
    return claimed;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

function getPeriod0TotalBalance(): bigint {
  try {
    // 讀取 period-0-claimed.json 檔案
    const rawData = fs.readFileSync(
      "subgraph-data/period-0-claimed.json",
      "utf-8"
    );
    const jsonData = JSON.parse(rawData);

    // 提取 claimedPerPeriods 數據
    const claimedPerPeriods: ClaimedAccount[] = jsonData.data.claimedPerPeriods;

    // 初始 totalBalance 為 0
    let totalBalance: bigint = BigInt(0);

    // 將每個 balance 值轉換為 bigint 並加總到 totalBalance 中
    claimedPerPeriods.forEach((account) => {
      totalBalance += BigInt(account.balance);
    });

    return totalBalance;
  } catch (error) {
    console.error("Error reading period-0-claimed.json:", error);
    return BigInt(0);
  }
}

// ------------------------------
// --- findUnclaimedAddresses ---
// ------------------------------

interface UnclaimedAccount {
  address: string;
}

interface ClaimedAccount {
  from: string;
}

function getUnclaimedAddresses(): string[] {
  try {
    // 讀取 period0_unclaimed.json 檔案
    const rawData = fs.readFileSync(
      "tokenlon-data/period0_unclaimed.json",
      "utf-8"
    );
    const jsonData = JSON.parse(rawData);

    // 提取 accounts 數據
    const accounts: UnclaimedAccount[] = jsonData.accounts;

    // 提取地址列表
    const unclaimedAddresses: string[] = accounts.map(
      (account) => account.address
    );

    return unclaimedAddresses;
  } catch (error) {
    console.error("Error reading period0_unclaimed.json:", error);
    return [];
  }
}

function getClaimedAddresses(): string[] {
  try {
    // 讀取 period-0-claimed.json 檔案
    const rawData = fs.readFileSync(
      "subgraph-data/period-0-claimed.json",
      "utf-8"
    );
    const jsonData = JSON.parse(rawData);

    // 提取 claimedPerPeriods 數據
    const claimedPerPeriods: ClaimedAccount[] = jsonData.data.claimedPerPeriods;

    // 提取地址列表
    const claimedAddresses: string[] = claimedPerPeriods.map(
      (account) => account.from
    );

    return claimedAddresses;
  } catch (error) {
    console.error("Error reading period-0-claimed.json:", error);
    return [];
  }
}

function findUnclaimedAddresses(): string[] {
  const unclaimedAddresses = getUnclaimedAddresses();
  const claimedAddresses = getClaimedAddresses();

  // 找出在 tokenlon-data/period0_unclaimed.json 中有而在 subgraph-data/period-0-claimed.json 中有的地址
  const unclaimedButNotClaimed = unclaimedAddresses.filter((address) =>
    claimedAddresses.includes(address)
  );

  return unclaimedButNotClaimed;
}

// ------------
// --- main ---
// ------------

async function main() {
  const tokenlonData = getTokenlonData();
  const subgraphData = getSubgraphData();
  const subgraphPeriod0TotalBalance = getPeriod0TotalBalance();
  console.log(`tokenlonData: ${tokenlonData}`);
  console.log(`subgraphData: ${subgraphData}`);
  console.log(`subgraphPeriod0TotalBalance: ${subgraphPeriod0TotalBalance}`);
  console.log(
    `subgraph period 0 total balance correct? ${
      subgraphData[0] === subgraphPeriod0TotalBalance
    }`
  );

  // 找出未被索賠的地址
  const unclaimedAddresses = findUnclaimedAddresses();
  console.log("Unclaimed addresses:", unclaimedAddresses);
  console.log("Done.");
}

main().catch(console.error);
