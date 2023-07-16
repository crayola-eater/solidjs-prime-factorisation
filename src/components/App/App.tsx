import { type Component, onCleanup, onMount, For } from "solid-js";
import { createJobsStore } from "../../stores/jobs";
import css from "./App.module.css";
import { JobItem } from "../index";

const App: Component = () => {
  const { jobs, handleOnCleanup, handleOnMount, startProcessingJobs } = createJobsStore();

  let intervalId: number;

  onMount(() => {
    intervalId = handleOnMount();
    startProcessingJobs();
  });

  onCleanup(() => {
    handleOnCleanup(intervalId);
  });

  return (
    <main class={css.main}>
      <For each={jobs} fallback={<p>No jobs added yet, please wait...</p>}>
        {(job) => <JobItem job={job} />}
      </For>
    </main>
  );
};

export default App;
