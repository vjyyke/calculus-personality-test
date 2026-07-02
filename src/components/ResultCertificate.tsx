import type { PersonalityResult } from "../data/testData";
import type { ScoredResult } from "../lib/scoring";

type ResultCertificateProps = {
  result: PersonalityResult;
  scored: ScoredResult;
};

export function ResultCertificate({ result, scored }: ResultCertificateProps) {
  const dimensions = scored.chineseCode.split("-");

  return (
    <section className="resultHero" aria-labelledby="certificate-title">
      <div className="certificateCard" id="compact-certificate">
        <div className="certificateMeta">
          <span>人格判定证书</span>
          <span>No. {result.code}</span>
        </div>
        <div className="certificateBody">
          <img className="resultCharacter" src={result.image} alt={`${result.shortName} 角色图`} />
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
        <div className="dimensionChips">
          <span>信息入口：{dimensions[0]}</span>
          <span>决策依据：{dimensions[1]}</span>
          <span>处理方式：{dimensions[2]}</span>
          <span>行动偏好：{dimensions[3]}</span>
        </div>
        <p className="certificateFooter">高数解题人格测试</p>
      </div>
    </section>
  );
}
