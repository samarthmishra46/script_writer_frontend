export function NoCommit(){
    return (
        <>
        <div className="relative overflow-hidden bg-[#E7E8F8] h-8 flex items-center">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* First set */}
          {Array(4)
            .fill("No Commitments · Cancel Anytime")
            .map((text, i) => (
              <span key={`set1-${i}`} className="mx-8 text-xs font-medium">
                {text}
              </span>
            ))}

          {/* Duplicate set for seamless loop */}
          {Array(4)
            .fill("No Commitments · Cancel Anytime")
            .map((text, i) => (
              <span key={`set2-${i}`} className="mx-8 text-xs font-medium">
                {text}
              </span>
            ))}
            {/* Duplicate set for seamless loop */}
          {Array(4)
            .fill("No Commitments · Cancel Anytime")
            .map((text, i) => (
              <span key={`set2-${i}`} className="mx-8 text-xs font-medium">
                {text}
              </span>
            ))}
        </div>
      </div></>
    )
}