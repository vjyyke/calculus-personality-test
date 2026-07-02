import type { PersonalityResult } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";

type ResultCertificateProps = {
  result: PersonalityResult;
  scored: ScoredResult;
};

export function ResultCertificate({ result, scored }: ResultCertificateProps) {
  return (
    <section className="resultHero" aria-labelledby="certificate-title">
      <div className="certificatePoster certificatePortrait">
        <div className="posterImagePanel">
          <img className="posterCharacter" src={result.image} alt={`${result.shortName} 角色图`} />
        </div>
        <div className="certificateContent">
          <div className="certificateMeta">
            <span>人格判定证书</span>
            <span>No. {result.code}</span>
          </div>
          <div className="certificateBody">
            <div>
              <p className="eyebrow">你的思维人格是</p>
              <h2 id="certificate-title">
                {result.typeName}｜{result.shortName}
              </h2>
              <p className="resultCode">
                {result.chineseCode} / {result.code}
              </p>
              <p className="resultShort">{result.shortDescription}</p>
            </div>
          </div>
          <p className="certificateFooter">高数解题人格测试</p>
        </div>
      </div>
    </section>
  );
}
