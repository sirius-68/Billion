const steps = [
  {
    title: "Share a bill",
    body: "Upload a real bill — rent, a utility, a medical invoice, tuition.",
  },
  {
    title: "We verify it",
    body: "Our team checks the bill with the biller before anyone can see it.",
  },
  {
    title: "Sponsors pay the biller",
    body: "Money goes straight to the biller, never through a personal account.",
  },
];

export default function HomePage() {
  return (
    <main className="home">
      <header className="hero">
        <p className="eyebrow">Coming soon to the US</p>
        <h1>Help pay a real bill, directly.</h1>
        <p className="lede">
          Billion connects people facing a bill with sponsors who want to help — and sends every
          dollar straight to the biller.
        </p>
      </header>

      <ol className="steps">
        {steps.map((step, i) => (
          <li key={step.title}>
            <span className="step-number">{i + 1}</span>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
