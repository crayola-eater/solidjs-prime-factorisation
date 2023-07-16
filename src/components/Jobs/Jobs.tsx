import { type Component, For } from "solid-js";
import { Job } from "../../types";
import css from "./Jobs.module.css";
import { JobItem } from "./JobItem";

export const Jobs: Component<{ jobs: Job[] }> = (props) => {
  return (
    <main class={css.jobs}>
      <For each={props.jobs} fallback={<p>No jobs added yet, please wait...</p>}>
        {(job) => {
          return <JobItem job={job} />;
        }}
      </For>
    </main>
  );
};
