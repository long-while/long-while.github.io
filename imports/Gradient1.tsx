import imgImg from "figma:asset/09d469ad80f54bf22d0f0c6eb5202d72fe22deb1.png";

function Img() {
  return (
    <div className="aspect-[435/292.4830627441406] relative shrink-0 w-full" data-name="IMG">
      <img alt="Orange gradient with shades of blue" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg} />
    </div>
  );
}

export default function Gradient() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative size-full" data-name="Gradient 1">
      <Img />
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Gradient 1</p>
      </div>
    </div>
  );
}