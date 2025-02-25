'use client'

export default function ContributionsGraph() {
  return (
    <div className="relative group">
      <div className="bg-white p-4">
        <style jsx>{`
          .contribution-graph :global(rect[data-level="0"]) {
            fill: #0099ff;
          }
          .contribution-graph :global(rect[data-level="1"]) {
            fill: rgba(0, 132, 255, 0.3);
          }
          .contribution-graph :global(rect[data-level="2"]) {
            fill: rgba(255, 255, 255, 0.5);
          }
          .contribution-graph :global(rect[data-level="3"]) {
            fill: rgba(255, 255, 255, 0.7);
          }
          .contribution-graph :global(rect[data-level="4"]) {
            fill: rgb(0, 153, 255);
          }
          .contribution-graph :global(text) {
            fill: red;
            font-size: 16px;
          }
        `}</style>
        <div className="contribution-graph">
          <img 
            src="https://ghchart.rshah.org/00000/maskjelly" 
            alt="GitHub Contributions" 
            className="w-full transition-transform duration-200 group-hover:scale-[1.01] [&_rect]:transition-all [&_rect]:duration-200"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  )
}
