import '../about/about.css'

export default function Approach() {
  return (
    <section id="approach" className="glass-sec right" aria-labelledby="approach-heading">
      <div className="glass" data-reveal>
        <div className="lab">04 / Approach</div>
        <h2 id="approach-heading" data-words>
          From research to running product.
        </h2>
        <p>
          Right now I'm going deeper on the AI side of my work. That means LLMs and agentic
          workflows, prompt and context engineering, and retrieval pipelines, while keeping every
          interface I ship fast, accessible and good to look at.
        </p>
        <p>
          I also have a soft spot for IoT and embedded systems. There's something satisfying about
          software that has to answer to real hardware. It isn't my day to day yet, but it's the
          kind of project I'd take on in a heartbeat.
        </p>

        <div className="meta">
          <div>
            <b>LLMs</b>
            <span>+ Agents</span>
          </div>
          <div>
            <b>IoT</b>
            <span>+ Embedded</span>
          </div>
        </div>
      </div>
    </section>
  )
}
