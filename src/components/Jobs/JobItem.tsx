import { type Component, For } from "solid-js";
import { type Job } from "../../types";
import css from "./JobItem.module.css";

const Equation: Component<{ factors: [string, string][] }> = (props) => {
  function sorted() {
    return props.factors.slice().sort(([a], [b]) => Number((BigInt(a) - BigInt(b)) % 10n));
  }
  return (
    <p class={css.equation}>
      <For each={sorted()} fallback="No factors yet">
        {([base, exponent], index) => {
          return (
            <>
              {index() > 0 && " ⋅ "}
              {base}
              {exponent !== "1" && <sup>{exponent}</sup>}
            </>
          );
        }}
      </For>
    </p>
  );
};

export const JobItem: Component<{ job: Job }> = (props) => {
  return (
    <section class={css.container}>
      {<p class={css.bigint}>{`#: ${props.job.bigint}`}</p>}
      <progress max={100} value={props.job.percentageDone} class={css.progressBar}></progress>
      <Equation factors={props.job.factors} />
    </section>
  );
};
