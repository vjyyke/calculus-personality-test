type HomeProps = {
  onStart: () => void;
};

export function Home({ onStart }: HomeProps) {
  return (
    <section className="homePage">
      <div className="heroText">
        <p className="eyebrow">Calculus Persona</p>
        <h1>高数解题人格测试</h1>
        <p className="heroCopy">
          这不是数学能力测试，而是看你面对复杂问题时如何进入、判断、推进和取舍。
        </p>
        <button className="primaryButton" type="button" onClick={onStart}>
          开始测试
        </button>
      </div>
      <div className="heroNotebook" aria-hidden="true">
        <div className="formulaField">
          <span className="formulaSymbol">∫</span>
          <span className="formulaLine">lim x→0</span>
          <span className="formulaLine">Σ aₙ</span>
          <span className="formulaTrace">判断、构造、拆解、统摄</span>
        </div>
      </div>
    </section>
  );
}
