export default function PageSkeleton() {
  return (
    <section className="section" aria-busy="true" aria-label="Loading">
      <div className="container">
        <div className="sk-head">
          <div className="sk" style={{ width: 90, height: 12 }} />
          <div className="sk" style={{ width: 'min(320px, 70%)', height: 34 }} />
        </div>
        <div className="sk-grid">
          {[0, 1, 2].map((i) => (
            <div className="sk-card" key={i}>
              <div className="sk sk-img" />
              <div className="sk" style={{ width: '38%', height: 10 }} />
              <div className="sk" style={{ width: '78%', height: 16 }} />
              <div className="sk" style={{ width: '94%', height: 10 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}