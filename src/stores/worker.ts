import type { MessageFromMainThread, MessageFromWorkerThread } from "../types";

declare const self: Worker;

function createRandomBigInt(length = 1_000): bigint {
  const arr = new Uint8Array(length);
  return crypto.getRandomValues(arr).reduceRight((acc, byte) => (acc << 8n) + BigInt(byte), 0n);
}

function sleep(duration = 1_000): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });
}

function handleNewFactorPair([left, right]: [bigint, bigint], messageId: number): void {
  const reply: MessageFromWorkerThread = {
    kind: "NEW_FACTOR_PAIR",
    factorPair: [left.toString(10), right.toString(10)],
    messageId,
  };
  self.postMessage(reply);
}

function handlePercentageUpdate(percentage: number, messageId: number): void {
  const reply: MessageFromWorkerThread = {
    kind: "PERCENTAGE_UPDATE",
    messageId,
    percentage,
  };
  self.postMessage(reply);
}

self.addEventListener("message", async (message: MessageEvent<MessageFromMainThread>) => {
  const messageId = message.data.messageId;
  switch (message.data.kind) {
    case "RANDOM_BIG_INT_REQUEST": {
      const val = createRandomBigInt(message.data.length);
      {
        const reply: MessageFromWorkerThread = {
          kind: "BIG_INT_CREATED",
          bigint: val.toString(10),
          messageId,
        };

        self.postMessage(reply);
      }

      await getFactorsForN(val, {
        onFactorPair(pair) {
          handleNewFactorPair(pair, messageId);
        },
        onPercentageUpdate(percentage) {
          handlePercentageUpdate(percentage, messageId);
        },
      });

      {
        const reply: MessageFromWorkerThread = {
          kind: "FACTORS_DONE",
          messageId,
        };
        self.postMessage(reply);
      }

      break;
    }
    default: {
      console.log("unknown message received by random int", message);
    }
  }
});

function calculateSquareRootOfBigInt(value: bigint): bigint {
  for (let current = 1n; value >= 2n; ) {
    const next = (value / current + current) >> 1n;

    if (current === next || current === next - 1n) {
      value = current;
      break;
    }

    current = next;
  }

  return value;
}

function* generateCandidates(): Generator<bigint, void, undefined> {
  yield* [2n, 3n, 5n, 7n];

  // prettier-ignore
  const increments = [4n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 4n, 8n, 6n, 4n, 6n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 6n, 4n, 2n, 6n, 4n, 6n, 8n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 6n, 6n, 2n, 6n, 4n, 6n, 2n, 10n, 2n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 2n, 10n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 6n, 4n, 2n, 4n, 6n, 2n, 6n, 4n, 2n, 4n];

  for (let candidate = 7n; true; ) {
    for (const inc of increments) {
      yield (candidate += inc);
    }
  }
}

type Options = {
  onFactorPair: (pair: [bigint, bigint]) => void;
  onPercentageUpdate: (percentage: number) => void;
};

async function getFactorsForN(remaining: bigint, options: Options): Promise<void> {
  const limit = calculateSquareRootOfBigInt(remaining);
  let i = 0;

  function calcPercentage(candidate: bigint): number {
    const multiplier = 1_000_000_000_000_000_000n;
    const divided = ((candidate * multiplier) / limit).toString(10);
    return parseFloat(divided) / 1e16;
  }

  for (const candidate of generateCandidates()) {
    if (0 === i % 100_000) {
      const percentage = calcPercentage(candidate);
      options.onPercentageUpdate(percentage);
      await sleep(10);

      if (0 === i % 1e8) {
        console.clear();
      }
    }
    if (candidate > remaining || candidate > limit) {
      if (remaining > 1) {
        options.onFactorPair([remaining, 1n]);
      }
      break;
    }

    let count = 0n;

    while (0n === remaining % candidate) {
      count++;
      remaining /= candidate;
    }

    if (count > 0) {
      options.onFactorPair([candidate, count]);
      options.onPercentageUpdate(calcPercentage(candidate));
    }

    i++;
  }
}
