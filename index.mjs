import { Client, Contract } from "ib-tws-api";

const TIMER_DELAY = 1000 * 30; // 30 seconds

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function showHistoricalData(api, app) {
  const details = await api.getHistoricalData({
    contract: Contract.future({
      symbol: "MES",
      lastTradeDateOrContractMonth: "20240315",
      exchange: "CME",
    }),
    duration: "60 S",
    barSizeSetting: "1 min",
    whatToShow: "MIDPOINT",
    useRth: 1,
    formatDate: 1,
  });

  app.runNumber += 1;

  const timeStr = new Date().toLocaleTimeString();
  console.log(`${timeStr}, ${JSON.stringify(details)}`);
}

function shutdown(app) {
  app.run = false;
  console.log("start shutdown....");
}

async function run() {
  let api = new Client({
    host: "127.0.0.1",
    port: 4002,
  });
  let time = await api.getCurrentTime();
  console.log("current time: " + time);

  const app = {
    runNumber: 0,
    run: true,
  };
  process.on("SIGINT", () => {
    shutdown(app);
  });
  process.on("SIGTERM", () => {
    shutdown(app);
  });

  while (app.run) {
    await showHistoricalData(api, app);
    await sleep(TIMER_DELAY);
  }
  console.log("Runs: " + app.runNumber + " times");
}

run()
  .then(() => {
    console.log("finish");
    process.exit();
  })
  .catch((e) => {
    console.log("failure");
    console.log(e);
    process.exit();
  });
