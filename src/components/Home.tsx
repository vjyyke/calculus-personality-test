type HomeProps = {
  onStart: () => void;
};

export function Home({ onStart }: HomeProps) {
  return (
    <section className="homePage homeCentered">
      <div className="heroText">
        <p className="eyebrow">Calculus Persona</p>
        <h1>高数人格测试</h1>
        <p className="heroCopy">
          {"这个测试不评价你的数学能力，而是希望通过你的高数习惯，"}
          <span className="keepTogether">了解你的思维方式。</span>
        </p>
        <button className="primaryButton" type="button" onClick={onStart}>
          开始测试
        </button>
      </div>
    </section>
  );
}
