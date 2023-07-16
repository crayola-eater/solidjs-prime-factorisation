import { createStore } from "solid-js/store";
import type { Job, MessageFromWorkerThread, MessageFromMainThread } from "../types";

function sleep(duration = 1_000): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });
}

export function createJobsStore() {
  let jobId = 0;

  function createNewJob(): Job {
    const job: Job = {
      id: jobId++,
      status: "NOT_STARTED",
      percentageDone: 0,
      bigint: "",
      factors: [],
      length: 9,
      worker: new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
    };

    return job;
  }

  const [jobs, setJobs] = createStore<Job[]>(Array.from({ length: 20 }, createNewJob));

  function handleOnMount(): number {
    return setInterval(() => {
      if (jobs.length < 20) {
        setJobs((prev) => prev.concat(createNewJob()));
      }
    }, 100);
  }

  function handleOnCleanup(id: number): void {
    clearInterval(id);
    jobs.forEach((job) => {
      try {
        job.worker.terminate();
      } catch (e) {
        console.error("An error occurred whilst terminating worker", e);
      }
    });
  }

  async function startProcessingJobs(): Promise<void> {
    for (; ; await sleep(500)) {
      const currentJob = jobs.find((job) => job.status === "NOT_STARTED");

      const nothingToDo = undefined === currentJob;
      if (nothingToDo) {
        continue;
      }

      setJobs((job: Job) => job.id === currentJob.id, "status", "STARTED");

      currentJob.worker.addEventListener(
        "message",
        function handleMessage({ data }: MessageEvent<MessageFromWorkerThread>) {
          if (data.messageId !== currentJob.id) {
            return;
          }

          switch (data.kind) {
            case "BIG_INT_CREATED": {
              setJobs(
                (job: Job) => job.id === currentJob.id,
                "bigint",
                (prev) => prev || data.bigint
              );
              return;
            }
            case "NEW_FACTOR_PAIR": {
              setJobs(
                (job: Job) => job.id === currentJob.id,
                "factors",
                (prev) => prev.concat([data.factorPair])
              );
              return;
            }
            case "PERCENTAGE_UPDATE": {
              setJobs((job: Job) => job.id === currentJob.id, "percentageDone", data.percentage);
              return;
            }
            case "FACTORS_DONE": {
              setJobs((job: Job) => job.id === currentJob.id, {
                status: "DONE",
                percentageDone: 100,
              });
              currentJob.worker.removeEventListener("message", handleMessage);
              currentJob.worker.terminate();
            }
          }
        }
      );

      const message: MessageFromMainThread = {
        kind: "RANDOM_BIG_INT_REQUEST",
        messageId: currentJob.id,
        length: currentJob.length,
      };

      currentJob.worker.postMessage(message);
    }
  }

  return {
    jobs,
    handleOnCleanup,
    handleOnMount,
    startProcessingJobs,
  };
}
