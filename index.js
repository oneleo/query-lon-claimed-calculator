"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var getTokenlonData = function () {
    var totalSums = new Array(20).fill(BigInt(0));
    // Loop through each period JSON file
    for (var i = 0; i <= 20; i++) {
        var periodFileName = "period_".concat(i, ".json");
        var periodFilePath = "tokenlon-data/".concat(periodFileName);
        // Check if file exists
        if (fs.existsSync(periodFilePath)) {
            var periodData = JSON.parse(fs.readFileSync(periodFilePath, "utf-8"));
            // Calculate balance sum
            if (periodData.elements) {
                var periodBalanceSum = periodData.elements.reduce(function (acc, curr) {
                    return acc + BigInt(curr.balance);
                }, BigInt(0));
                // Store balance sum in totalSums array
                totalSums[i] = periodBalanceSum;
                // Update periodData's total_balance field
                periodData.total_balance = periodBalanceSum.toString();
            }
        }
        else {
            console.log("File ".concat(periodFileName, " not found."));
        }
    }
    return totalSums;
};
var getSubgraphData = function () {
    try {
        // 讀取 JSON 檔案
        var rawData = fs.readFileSync("subgraph-data/queryTotal.json", "utf-8");
        var jsonData = JSON.parse(rawData);
        // 提取 totalClaimedPerPeriods 數據
        var totalClaimedPerPeriods = jsonData.data.totalClaimedPerPeriods;
        // 創建 claimed 數組
        var claimed_1 = new Array(28).fill(BigInt(0));
        // 將每個 period 的 totalBalance 值存入 claimed 數組中
        totalClaimedPerPeriods.forEach(function (item) {
            var period = parseInt(item.period);
            var totalBalance = BigInt(item.totalBalance);
            // 將 period 值為 18446744073709551615 的 totalBalance 加到 claimed[0] 中
            if (period >= Number.MAX_SAFE_INTEGER) {
                period = 0;
            }
            claimed_1[period] += totalBalance;
        });
        // 返回 claimed 數組
        return claimed_1;
    }
    catch (error) {
        console.error("Error:", error);
        return [];
    }
};
function getPeriod0TotalBalance() {
    try {
        // 讀取 period-0-claimed.json 檔案
        var rawData = fs.readFileSync("subgraph-data/period-0-claimed.json", "utf-8");
        var jsonData = JSON.parse(rawData);
        // 提取 claimedPerPeriods 數據
        var claimedPerPeriods = jsonData.data.claimedPerPeriods;
        // 初始 totalBalance 為 0
        var totalBalance_1 = BigInt(0);
        // 將每個 balance 值轉換為 bigint 並加總到 totalBalance 中
        claimedPerPeriods.forEach(function (account) {
            totalBalance_1 += BigInt(account.balance);
        });
        return totalBalance_1;
    }
    catch (error) {
        console.error("Error reading period-0-claimed.json:", error);
        return BigInt(0);
    }
}
function getUnclaimedAddresses() {
    try {
        // 讀取 period0_unclaimed.json 檔案
        var rawData = fs.readFileSync("tokenlon-data/period0_unclaimed.json", "utf-8");
        var jsonData = JSON.parse(rawData);
        // 提取 accounts 數據
        var accounts = jsonData.accounts;
        // 提取地址列表
        var unclaimedAddresses = accounts.map(function (account) { return account.address; });
        return unclaimedAddresses;
    }
    catch (error) {
        console.error("Error reading period0_unclaimed.json:", error);
        return [];
    }
}
function getClaimedAddresses() {
    try {
        // 讀取 period-0-claimed.json 檔案
        var rawData = fs.readFileSync("subgraph-data/period-0-claimed.json", "utf-8");
        var jsonData = JSON.parse(rawData);
        // 提取 claimedPerPeriods 數據
        var claimedPerPeriods = jsonData.data.claimedPerPeriods;
        // 提取地址列表
        var claimedAddresses = claimedPerPeriods.map(function (account) { return account.from; });
        return claimedAddresses;
    }
    catch (error) {
        console.error("Error reading period-0-claimed.json:", error);
        return [];
    }
}
function findUnclaimedAddresses() {
    var unclaimedAddresses = getUnclaimedAddresses();
    var claimedAddresses = getClaimedAddresses();
    // 找出在 tokenlon-data/period0_unclaimed.json 中有而在 subgraph-data/period-0-claimed.json 中有的地址
    var unclaimedButNotClaimed = unclaimedAddresses.filter(function (address) {
        return claimedAddresses.includes(address);
    });
    return unclaimedButNotClaimed;
}
// ------------
// --- main ---
// ------------
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var tokenlonData, subgraphData, subgraphPeriod0TotalBalance, unclaimedAddresses;
        return __generator(this, function (_a) {
            tokenlonData = getTokenlonData();
            subgraphData = getSubgraphData();
            subgraphPeriod0TotalBalance = getPeriod0TotalBalance();
            console.log("tokenlonData: ".concat(tokenlonData));
            console.log("subgraphData: ".concat(subgraphData));
            console.log("subgraphPeriod0TotalBalance: ".concat(subgraphPeriod0TotalBalance));
            console.log("subgraph period 0 total balance correct? ".concat(subgraphData[0] === subgraphPeriod0TotalBalance));
            unclaimedAddresses = findUnclaimedAddresses();
            console.log("Unclaimed addresses:", unclaimedAddresses);
            console.log("Done.");
            return [2 /*return*/];
        });
    });
}
main().catch(console.error);
