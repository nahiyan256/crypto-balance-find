/**
 * ✅ Packages required:
 * react, react-dom, framer-motion, tailwindcss
 * 
 * 👉 Drop this file into a React + Tailwind + Framer Motion setup.
 * No backend or API calls — frontend-only demo.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CryptoBalanceFinder() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [foundCount, setFoundCount] = useState(0);
  const [totalFound, setTotalFound] = useState(0);
  const [alert, setAlert] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [premiumModal, setPremiumModal] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [withdrawProgress, setWithdrawProgress] = useState(0);
  const [withdrawStatus, setWithdrawStatus] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lastFound, setLastFound] = useState(null);
  const [walletAddr, setWalletAddr] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [plan, setPlan] = useState(null);
  const [method, setMethod] = useState(null);
  const [purchaseStep, setPurchaseStep] = useState("select");

  const scanInterval = useRef(null);

  const generateAddress = () => {
    const chars = "abcdef0123456789";
    let addr = "0x";
    for (let i = 0; i < 38; i++)
      addr += chars[Math.floor(Math.random() * chars.length)];
    return addr;
  };

  const randomAmount = () => (Math.random() * 999 + 1).toFixed(2);

  useEffect(() => {
    if (isScanning) {
      scanInterval.current = setInterval(() => {
        setScanned((prev) => {
          const inc = Math.floor(Math.random() * 800);
          const next = Math.min(prev + inc, 1000000);
          if (next >= 1000000) stopScan();
          return next;
        });

        setAddresses((prev) => {
          const newAddr = generateAddress();
          const isFound = Math.random() < 0.002;
          const newEntry = { addr: newAddr, amount: isFound ? randomAmount() : null };
          if (isFound) handleFound(newEntry.amount);
          const updated = [newEntry, ...prev.slice(0, 25)];
          return updated;
        });
      }, 100);
    }
    return () => clearInterval(scanInterval.current);
  }, [isScanning]);

  const handleFound = (amount) => {
    const val = parseFloat(amount);
    setFoundCount((c) => c + 1);
    setTotalFound((t) => parseFloat((t + val).toFixed(2)));
    setLastFound(val);
    setAlert(`💰 Found $${val}`);
    setTimeout(() => setAlert(null), 2500);
  };

  const startScan = () => {
    setIsScanning(true);
    setAlert(null);
  };
  const stopScan = () => {
    setIsScanning(false);
  };
  const resetScan = () => {
    setIsScanning(false);
    setScanned(0);
    setAddresses([]);
    setFoundCount(0);
    setTotalFound(0);
    setAlert(null);
  };

  const validateAddress = (addr) =>
    /^(0x[a-fA-F0-9]{40}|(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(
      addr
    );

  const handleWithdraw = () => {
    if (!validateAddress(walletAddr)) {
      setWithdrawStatus("❌ Invalid wallet address!");
      return;
    }
    if (!withdrawAmt || parseFloat(withdrawAmt) > totalFound) {
      setWithdrawStatus("❌ Invalid or excessive amount!");
      return;
    }
    setWithdrawProgress(0);
    setWithdrawStatus("⏳ Processing...");
    const interval = setInterval(() => {
      setWithdrawProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          const amt = parseFloat(withdrawAmt);
          setTotalFound((t) => parseFloat((t - amt).toFixed(2)));
          const rec = {
            wallet: walletAddr,
            amount: amt,
            time: new Date().toLocaleString(),
          };
          setWithdrawHistory((h) => [rec, ...h]);
          setWithdrawStatus("");
          setSuccessMsg(`✅ Withdraw Successful — $${amt}`);
          setTimeout(() => setSuccessMsg(""), 3000);
        }
        return Math.min(p + 10, 100);
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-10 px-3">
      {/* Title */}
      <motion.h1
        className="text-4xl md:text-6xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-500 animate-[hue_4s_linear_infinite]"
        style={{ filter: "hue-rotate(360deg)" }}
      >
        Crypto Balance Finder
      </motion.h1>

      {/* Stats */}
      <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-lg flex flex-wrap justify-center gap-4 w-full max-w-2xl">
        <div>🔍 Scanned: {scanned.toLocaleString()} / 1,000,000</div>
        <div>💰 Found: {foundCount}</div>
        <div>💵 Total: ${totalFound.toFixed(2)}</div>
      </div>

      {/* Scanning Area */}
      <div className="mt-6 w-full max-w-2xl bg-white/10 backdrop-blur-md p-4 rounded-2xl h-72 overflow-y-auto shadow-inner">
        {addresses.map((item, i) => (
          <div
            key={i}
            className={`text-sm md:text-base ${
              item.amount
                ? "text-green-400 font-semibold"
                : "text-gray-300 font-mono"
            }`}
          >
            {item.addr} {item.amount ? `→ $${item.amount}` : ""}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!isScanning ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={startScan}
            className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 shadow-lg"
          >
            ▶️ Start
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={stopScan}
            className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 shadow-lg"
          >
            ⏸ Stop
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={resetScan}
          className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 shadow-lg"
        >
          🔄 Reset
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setWithdrawModal(true)}
          className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 shadow-lg"
        >
          💸 Withdraw
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setPremiumModal(true)}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:opacity-90 shadow-lg"
        >
          💎 Premium
        </motion.button>
      </div>

      {/* Found alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 text-green-400 font-semibold text-lg"
          >
            {alert}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {withdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl w-11/12 md:w-1/2"
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-cyan-400">
                Withdraw Funds
              </h2>
              <input
                value={walletAddr}
                onChange={(e) => setWalletAddr(e.target.value)}
                placeholder="Wallet address"
                className="w-full p-2 mb-3 rounded-md bg-black/40 border border-gray-600"
              />
              <input
                type="number"
                value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(e.target.value)}
                placeholder="Amount"
                className="w-full p-2 mb-3 rounded-md bg-black/40 border border-gray-600"
              />
              <div className="flex justify-between mt-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWithdraw}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  Confirm
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWithdrawModal(false)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                >
                  Close
                </motion.button>
              </div>
              {withdrawStatus && (
                <p className="mt-3 text-center text-yellow-400">{withdrawStatus}</p>
              )}
              {withdrawProgress > 0 && withdrawProgress < 100 && (
                <div className="w-full bg-gray-700 rounded-full mt-3">
                  <div
                    className="h-2 bg-green-400 rounded-full transition-all"
                    style={{ width: `${withdrawProgress}%` }}
                  ></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 text-green-400 font-bold"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw History Section */}
      <div className="w-full max-w-2xl mt-10 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
        <h3 className="text-xl font-semibold mb-3 text-cyan-300">Withdraw History</h3>
        {withdrawHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">No withdraws yet.</p>
        ) : (
          withdrawHistory.map((h, i) => (
            <div
              key={i}
              className="border-b border-gray-700 py-2 text-sm flex justify-between"
            >
              <span>{h.time}</span>
              <span className="text-green-400">${h.amount}</span>
              <span className="truncate max-w-[150px]">{h.wallet}</span>
            </div>
          ))
        )}
      </div>

      {/* Premium Modal */}
      <AnimatePresence>
        {premiumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl w-11/12 md:w-1/2"
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-amber-400">
                Premium Plans
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { price: 40, days: 10 },
                  { price: 75, days: 18 },
                  { price: 120, days: 30 },
                  { price: 500, days: "Lifetime" },
                ].map((p, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPlan(p)}
                    className={`p-3 rounded-xl ${
                      plan === p
                        ? "bg-amber-600"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    ${p.price} — {p.days} days
                  </motion.button>
                ))}
              </div>
              {plan && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-gray-300">Select Payment Method:</p>
                  {["USDT", "BTC", "bKash", "Nagad"].map((m) => (
                    <motion.button
                      key={m}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMethod(m)}
                      className={`px-3 py-2 m-1 rounded-lg ${
                        method === m
                          ? "bg-amber-500"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {m}
                    </motion.button>
                  ))}
                  {method && (
                    <div className="mt-4 text-center text-sm text-gray-300">
                      <p>Contact on Telegram @Cryptography55 to complete purchase.</p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPurchaseStep("done")}
                        className="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                      >
                        Confirm Purchase
                      </motion.button>
                      {purchaseStep === "done" && (
                        <p className="mt-3 text-green-400">✅ Purchase successful!</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-5 text-center">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPremiumModal(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}