'use client'

export default function ContributionsGraph() {
  return (
    <div className="relative group">
      <div className="bg-black p-4">
        <style jsx>{`
          .contribution-graph :global(rect[data-level="0"]) {
            fill: rgba(255, 255, 255, 0.1);
          }
          .contribution-graph :global(rect[data-level="1"]) {
            fill: rgba(255, 255, 255, 0.3);
          }
          .contribution-graph :global(rect[data-level="2"]) {
            fill: rgba(255, 255, 255, 0.5);
          }
          .contribution-graph :global(rect[data-level="3"]) {
            fill: rgba(255, 255, 255, 0.7);
          }
          .contribution-graph :global(rect[data-level="4"]) {
            fill: rgba(255, 255, 255, 1);
          }
          .contribution-graph :global(text) {
            fill: white;
            font-size: 10px;
          }
        `}</style>
        <div className="contribution-graph">
          <img 
            src="https://ghchart.rshah.org/maskjelly" 
            alt="GitHub Contributions" 
            className="w-full transition-transform duration-200 group-hover:scale-[1.01] [&_rect]:transition-all [&_rect]:duration-200"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  )
}
