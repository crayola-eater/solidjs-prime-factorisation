export type Job = {
  id: number;
  status: "NOT_STARTED" | "STARTED" | "DONE";
  percentageDone: number;
  bigint: string;
  factors: [string, string][];
  length: number;
  worker: Worker;
};

export type RandomBigIntRequestMessageFromMainThread = {
  kind: "RANDOM_BIG_INT_REQUEST";
  messageId: number;
  length: number;
};

export type MessageFromMainThread = RandomBigIntRequestMessageFromMainThread;

export type BigIntCreatedMessageFromWorkerThread = {
  kind: "BIG_INT_CREATED";
  messageId: number;
  bigint: string;
};

export type NewFactorPairMessageFromWorkerThread = {
  kind: "NEW_FACTOR_PAIR";
  messageId: number;
  factorPair: [string, string];
};

export type FactorsDoneMessageFromWorkerThread = {
  kind: "FACTORS_DONE";
  messageId: number;
};

export type PercentageUpdateMessageFromWorkerThread = {
  kind: "PERCENTAGE_UPDATE";
  messageId: number;
  percentage: number;
};

export type MessageFromWorkerThread =
  | BigIntCreatedMessageFromWorkerThread
  | NewFactorPairMessageFromWorkerThread
  | FactorsDoneMessageFromWorkerThread
  | PercentageUpdateMessageFromWorkerThread;
