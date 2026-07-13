import { publications, PUBLICATION_STATUS_LABELS } from '../../lib/publications'
import './publications.css'

export default function Publications() {
  return (
    <section id="publications" className="pubs" aria-labelledby="publications-heading">
      <div className="pubs-head">
        <div className="lab">03 / Publications</div>
        <h2 id="publications-heading" data-words>
          Research, in the open.
        </h2>
      </div>

      <ol className="pubs-list">
        {publications.map((pub, i) => (
          <li key={pub.id} className="pub-row" data-reveal>
            <span className="pub-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="pub-body">
              <div className="pub-meta">
                <span className={`pub-status pub-status--${pub.status}`}>
                  {PUBLICATION_STATUS_LABELS[pub.status]}
                </span>
                <span className="pub-venue">{pub.venue}</span>
              </div>
              <h3 className="pub-title">{pub.title}</h3>
              <p className="pub-detail">{pub.detail}</p>
              {pub.url ? (
                <a className="pub-link" href={pub.url} target="_blank" rel="noopener noreferrer">
                  View paper ↗
                </a>
              ) : (
                <span className="pub-link pub-link--pending">Proceedings pending</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
