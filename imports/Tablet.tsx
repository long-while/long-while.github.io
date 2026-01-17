import svgPaths from "./svg-d3wa3ap4lu";
import imgHero from "figma:asset/2647bd88bf2e652f8f47ea40cab516c31fd3722e.png";
import imgImage from "figma:asset/9e3e69d410e2b4cb89fa65823701fc41770f171b.png";
import imgImg from "figma:asset/d80221821ae223649e8b2f7216864cefd44272d8.png";
import imgImg1 from "figma:asset/d587b7edf024e1dfe440e0d7aab56e714aaa90ea.png";
import imgImg2 from "figma:asset/e246b307db7858875c4ab997c79a4e5dac235221.png";
import imgImg3 from "figma:asset/f71100f3c3cc5527b658e530cc2c65f3ce7e084b.png";
import imgImg4 from "figma:asset/54631e3ee92200dde5f4b5773ac4d79e0c327d1b.png";
import imgImg5 from "figma:asset/3f90bcf89a2d0ff5f4a56ce8e1f56171e020b390.png";
import imgImg6 from "figma:asset/531fe144f97bd42e170b9dd78a6fd9e593acfd7a.png";
import imgImg7 from "figma:asset/ba43717b3bfb4419fe61acbc84b232e3935c62dd.png";
import imgImg8 from "figma:asset/0d56df29b770bd61627e15752eb0bece17277dc5.png";
import imgImg9 from "figma:asset/ce388d9a50576825c6d5269ba20e69e4e70366fa.png";
import imgImg10 from "figma:asset/f601bdb06822f42601f98ad9bdd2e7a00df5cef8.png";
import imgImg11 from "figma:asset/09d469ad80f54bf22d0f0c6eb5202d72fe22deb1.png";
import imgImg12 from "figma:asset/fb50f2cfef6a46b03a3845c3f1e185c248776b22.png";
import imgImg13 from "figma:asset/5f5ba4089e0ab088927557165f53e6157c004932.png";
import imgImg14 from "figma:asset/40680016abd32e966ae8688bd9aa63a8964667e8.png";
import imgImg15 from "figma:asset/11985e79ac7ac6bc48f9c95ee9381fa1b343172d.png";
import imgImage1 from "figma:asset/6478c217273757a655a984c8a0e5d361a6657555.png";
import imgImage2 from "figma:asset/9cec9446cde58bb130b64e8d067253839260d2d5.png";
import imgImage3 from "figma:asset/b1209199bcb4d964af7b2731b6a86e8dba75f367.png";
import imgImage4 from "figma:asset/1191b19feec60c41ddb32f779f3a5007cf369453.png";

function Hero() {
  return (
    <div className="h-[540px] relative shrink-0 w-full" data-name="Hero">
      <img alt="Logo on colored background" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHero} />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[32px] items-start relative shrink-0 w-full" data-name="Content">
      <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[60px] text-black tracking-[-0.6px] w-[316px]">
        <h1 className="block css-4hzbpn leading-[1.1]">Brand Guidelines</h1>
      </div>
      <div className="flex flex-[1_0_0] flex-col justify-center leading-[1.2] min-h-px min-w-px relative text-[#575757] text-[15px] tracking-[-0.15px]">
        <p className="css-4hzbpn mb-0">This guide defines the visual language, design style, and principles that shape a clear and consistent brand experience, no matter the team or area of expertise.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn mb-0">At its core, Redo is about precision and clarity—just like our mission to correct financial errors and optimize balance sheets. This guide lays out the essential design standards that bring our brand to life, from our color system and typography to accessibility benchmarks and documentation.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn">{`Whether you're designing for digital platforms or printed materials, these guidelines ensure every touchpoint reflects the trust and efficiency at the heart of Redo.`}</p>
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <section className="relative shrink-0 w-full" data-name="Intro section">
      <div className="content-stretch flex flex-col items-start pb-[80px] pt-[32px] px-[32px] relative w-full">
        <Content />
      </div>
    </section>
  );
}

function List1() {
  return (
    <li className="content-stretch flex items-start p-0 relative shrink-0 w-full" data-name="List 1">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[30px] text-black tracking-[-0.6px]">
        <p className="css-ew64yg leading-[1.2]">
          <span className="text-[#575757]">01</span>
          <span>{` Brand Strategy`}</span>
        </p>
      </div>
    </li>
  );
}

function List2() {
  return (
    <li className="content-stretch flex items-start p-0 relative shrink-0 w-full" data-name="List 2">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[30px] text-black tracking-[-0.6px]">
        <p className="css-ew64yg leading-[1.2]">
          <span className="text-[#575757]">02</span>
          <span>{` Personality`}</span>
        </p>
      </div>
    </li>
  );
}

function List3() {
  return (
    <li className="content-stretch flex items-start p-0 relative shrink-0 w-full" data-name="List 3">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[30px] text-black tracking-[-0.6px]">
        <p className="css-ew64yg leading-[1.2]">
          <span className="text-[#575757]">03</span>
          <span>{` Logo`}</span>
        </p>
      </div>
    </li>
  );
}

function List4() {
  return (
    <li className="content-stretch flex items-start p-0 relative shrink-0 w-full" data-name="List 4">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[30px] text-black tracking-[-0.6px]">
        <p className="css-ew64yg leading-[1.2]">
          <span className="text-[#575757]">04</span>
          <span>{` Color`}</span>
        </p>
      </div>
    </li>
  );
}

function List5() {
  return (
    <li className="content-stretch flex items-start p-0 relative shrink-0 w-full" data-name="List 5">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[30px] text-black tracking-[-0.6px]">
        <p className="css-ew64yg leading-[1.2]">
          <span className="text-[#575757]">05</span>
          <span>{` Typography`}</span>
        </p>
      </div>
    </li>
  );
}

function List6() {
  return (
    <li className="content-stretch flex items-start p-0 relative shrink-0 w-full" data-name="List 6">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[30px] text-black tracking-[-0.6px]">
        <p className="css-ew64yg leading-[1.2]">
          <span className="text-[#575757]">06</span>
          <span>{` Art Direction`}</span>
        </p>
      </div>
    </li>
  );
}

function List() {
  return (
    <ol className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px p-0 relative" data-name="List">
      <List1 />
      <List2 />
      <List3 />
      <List4 />
      <List5 />
      <List6 />
    </ol>
  );
}

function TableOfContents() {
  return (
    <section aria-label="Table of contents" className="h-[348px] relative shrink-0 w-full" data-name="Table of contents">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[32px] items-start pb-[80px] pt-[32px] px-[32px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[30px] text-black tracking-[-0.6px]">
            <h2 className="block css-4hzbpn leading-[1.2]">Contents</h2>
          </div>
          <List />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
    </section>
  );
}

function Title() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-end min-h-px min-w-px relative" data-name="Title">
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[60px] text-black tracking-[-0.6px] w-[224px]">
        <h2 className="css-4hzbpn leading-[1.1]">
          <span className="text-[#f45f00]">01</span>
          <span>{`  Brand Strategy`}</span>
        </h2>
      </div>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[32px] items-start min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[1.2] relative shrink-0 text-[#575757] text-[15px] tracking-[-0.15px] w-full">
        <p className="css-4hzbpn mb-0">{`In the world of finance, mistakes happen—miscalculations, overlooked expenses, inefficiencies that silently erode profitability. Businesses lose money not because they aren’t earning, but because errors go unchecked. `}</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn">Redo restores confidence in financial numbers.</p>
      </div>
      <div className="aspect-[860/888] relative shrink-0 w-full" data-name="Image">
        <img alt="Person with iPad" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[1.2] relative shrink-0 text-[#575757] text-[15px] tracking-[-0.15px] w-full">
        <p className="css-4hzbpn mb-0">Born from the need for financial clarity, Redo was founded on a simple yet powerful mission: to correct financial errors and optimize balance sheets. We believe that precision is the key to profitability, and that businesses shouldn’t be held back by avoidable losses. With advanced technology and expert analysis, we uncover discrepancies, eliminate inefficiencies, and restore confidence in the numbers that drive success.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn">At Redo, we don’t just fix mistakes—we empower businesses to move forward with accuracy and efficiency. Because when the numbers are right, the future looks even brighter.</p>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Header">
      <Title />
      <Content1 />
    </div>
  );
}

function StrategySection() {
  return (
    <section className="content-stretch flex flex-col items-start px-[32px] py-[88px] relative shrink-0 w-[800px]" data-name="Strategy section">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <Header />
    </section>
  );
}

function Number() {
  return <div className="flex-[1_0_0] h-full min-h-px min-w-px" data-name="Number" />;
}

function Title1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-end min-h-px min-w-px relative" data-name="Title">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[60px] text-black tracking-[-0.6px]">
        <h2 className="css-ew64yg leading-[1.1]">
          <span className="text-[#f45f00]">02</span>
          <span>{`  Personality`}</span>
        </h2>
      </div>
      <div className="flex flex-[1_0_0] flex-row items-end self-stretch">
        <Number />
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Text">
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#575757] text-[15px] tracking-[-0.15px] w-full">
        <p className="css-4hzbpn leading-[1.2]">Redo’s voice brings our brand to life through the words we write and speak. The way we communicate with customers has the power to transform their financial well-being. Through clear and intentional language, we make financial corrections simple, accessible, and stress-free. Our direct, approachable, and transparent voice ensures that fixing mistakes feels effortless—so our customers can move forward with confidence.</p>
      </div>
    </div>
  );
}

function Header1() {
  return (
    <div className="content-stretch flex gap-[32px] items-start pb-[32px] pt-0 px-0 relative shrink-0 w-full" data-name="Header">
      <Title1 />
      <Text />
    </div>
  );
}

function Img() {
  return (
    <div className="aspect-[736/500] relative shrink-0 w-full" data-name="IMG">
      <img alt="'precise, trustworthy, approachable, reliable'" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg} />
    </div>
  );
}

function Title2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Title">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[22px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2]">{`Tone & Voice`}</h3>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Row 1">
      <div className="flex flex-col font-['Rethink_Sans:Bold',sans-serif] font-bold justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">Our Vision: why we exist</p>
      </div>
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">To create a future where every business maximizes their potential.</p>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Row 2">
      <div className="flex flex-col font-['Rethink_Sans:Bold',sans-serif] font-bold justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">Our Mission: what we do</p>
      </div>
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">Correct financial errors and optimize balance sheets</p>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Row 3">
      <div className="flex flex-col font-['Rethink_Sans:Bold',sans-serif] font-bold justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">Our Promise: how we help</p>
      </div>
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">Empower businesses to move forward with accuracy and efficiency</p>
      </div>
    </div>
  );
}

function Examples() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[40px] items-start justify-center leading-[0] min-h-px min-w-px relative text-[15px] tracking-[-0.15px]" data-name="Examples">
      <Row />
      <Row1 />
      <Row2 />
    </div>
  );
}

function ToneAndVoice() {
  return (
    <div className="content-stretch flex gap-[32px] items-start px-0 py-[32px] relative shrink-0 w-full" data-name="Tone and voice">
      <Title2 />
      <Examples />
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[22px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2]">Sample Copy</h3>
      </div>
    </div>
  );
}

function Sample() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] h-full items-start min-h-px min-w-px relative" data-name="Sample 1">
      <div className="flex flex-col font-['Rethink_Sans:Bold',sans-serif] font-bold justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">Your Finances, Fixed the Right Way</p>
      </div>
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">Precision matters when it comes to financial corrections. A small error can have a big impact on your savings, credit score, or future financial goals.</p>
      </div>
    </div>
  );
}

function Sample1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] h-full items-start min-h-px min-w-px relative" data-name="Sample 2">
      <div className="flex flex-col font-['Rethink_Sans:Bold',sans-serif] font-bold justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">We Handle the Fix, You Focus on What Matters</p>
      </div>
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">Your time is valuable, and dealing with financial errors shouldn’t take up more of it than necessary. Whether it’s an unexpected overdraft fee or a billing mistake, we take care of the correction process for you.</p>
      </div>
    </div>
  );
}

function Sample2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] h-full items-start min-h-px min-w-px relative" data-name="Sample 3">
      <div className="flex flex-col font-['Rethink_Sans:Bold',sans-serif] font-bold justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">Mistakes Don’t Have to Cost You—We’ve Got Your Back</p>
      </div>
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">{`An overlooked charge or a simple accounting mistake shouldn’t throw off your financial plans. We step in to identify and correct these issues before they become bigger problems. `}</p>
      </div>
    </div>
  );
}

function Sample3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] h-full items-start min-h-px min-w-px relative" data-name="Sample 4">
      <div className="flex flex-col font-['Rethink_Sans:Bold',sans-serif] font-bold justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">See an Error? We’ll Make It Right.</p>
      </div>
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">{`Not sure what that unexpected charge is? Worried about an incorrect withdrawal? Instead of worrying or assuming the worst, let us investigate and resolve the issue for you. `}</p>
      </div>
    </div>
  );
}

function Samples() {
  return (
    <div className="content-stretch flex gap-[32px] h-[284px] items-start leading-[0] relative shrink-0 text-[15px] tracking-[-0.15px] w-full" data-name="Samples">
      <Sample />
      <Sample1 />
      <Sample2 />
      <Sample3 />
    </div>
  );
}

function SampleCopy() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-start px-0 py-[32px] relative shrink-0 w-full" data-name="Sample copy">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <SectionHeader />
      <Samples />
    </div>
  );
}

function PersonalitySection() {
  return (
    <div aria-label="Section 2 out of 6" className="content-stretch flex flex-col gap-[30px] items-start pb-[80px] pt-[88px] px-[32px] relative shrink-0 w-[800px]" data-name="Personality Section">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <Header1 />
      <Img />
      <ToneAndVoice />
      <SampleCopy />
    </div>
  );
}

function Number1() {
  return <div className="flex-[1_0_0] h-full min-h-px min-w-px" data-name="Number" />;
}

function Title3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-end min-h-px min-w-px relative" data-name="Title">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[60px] text-black tracking-[-0.6px]">
        <h2 className="css-ew64yg leading-[1.1]">
          <span className="text-[#f45f00]">03</span>
          <span>{`  Logo`}</span>
        </h2>
      </div>
      <div className="flex flex-[1_0_0] flex-row items-end self-stretch">
        <Number1 />
      </div>
    </div>
  );
}

function Content2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[1.2] relative shrink-0 text-[#575757] text-[15px] tracking-[-0.15px] w-full">
        <p className="css-4hzbpn mb-0">The Redo logo is a sleek, modern arrow that curves backward, symbolizing the power to rewind, correct, and optimize financial decisions. The reversed motion represents our core mission—helping businesses go back, fix errors, and recover lost value.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn mb-0">Designed with clean, sharp lines, the arrow conveys precision and efficiency, while its fluid motion suggests agility and adaptability in financial correction. The color palette reinforces trust and clarity—deep blues or greens for stability, complemented by bold accents to signify action and resolution.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn">More than just a symbol, the Redo logo embodies our commitment to turning financial missteps into opportunities for growth—because tin business, every mistake deserves a second chance.</p>
      </div>
    </div>
  );
}

function Header2() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Header">
      <Title3 />
      <Content2 />
    </div>
  );
}

function SectionHeader1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[22px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2]">Primary Lockup</h3>
      </div>
    </div>
  );
}

function Img1() {
  return (
    <div className="aspect-[966/500.09246826171875] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of primary brand logo" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg1} />
    </div>
  );
}

function Diagram() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start pb-0 pt-[40px] px-0 relative shrink-0 w-full" data-name="Diagram 1">
      <SectionHeader1 />
      <Img1 />
    </div>
  );
}

function SectionHeader2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[22px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2]">Clearspace</h3>
      </div>
    </div>
  );
}

function Img2() {
  return (
    <div className="aspect-[464/240] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of brand logo in clearspace" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg2} />
    </div>
  );
}

function Diagram1() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Diagram 2">
      <SectionHeader2 />
      <Img2 />
    </div>
  );
}

function SectionHeader3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[22px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2]">Secondary Lockups</h3>
      </div>
    </div>
  );
}

function Img3() {
  return (
    <div className="aspect-[966/500] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of secondary brand logo" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg3} />
    </div>
  );
}

function Diagram2() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Diagram 3">
      <SectionHeader3 />
      <Img3 />
    </div>
  );
}

function SectionHeader4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[22px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2]">Incorrect Usage</h3>
      </div>
    </div>
  );
}

function Img4() {
  return (
    <div className="aspect-[464/240] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of brand logo incorrectly sized" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg4} />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon 1">
          <path d={svgPaths.p180dff00} fill="var(--fill-0, #F20909)" />
          <path d="M5 4.79688L11.4 11.1969" id="Vector 4702" stroke="var(--stroke-0, white)" strokeWidth="2" />
          <path d={svgPaths.p94a600} id="Vector 4703" stroke="var(--stroke-0, white)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Label">
      <Icon1 />
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[13px] text-black tracking-[-0.13px]">
        <p className="css-ew64yg leading-[1.2]">Do not resize the mark</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Item 1">
      <Img4 />
      <Label />
    </div>
  );
}

function Img5() {
  return (
    <div className="aspect-[464/240] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of brand logo incorrectly rotated" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg5} />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon 1">
          <path d={svgPaths.p180dff00} fill="var(--fill-0, #F20909)" />
          <path d="M5 4.79688L11.4 11.1969" id="Vector 4702" stroke="var(--stroke-0, white)" strokeWidth="2" />
          <path d={svgPaths.p94a600} id="Vector 4703" stroke="var(--stroke-0, white)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Label">
      <Icon2 />
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[13px] text-black tracking-[-0.13px]">
        <p className="css-ew64yg leading-[1.2]">Do not rotate the logo</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Item 2">
      <Img5 />
      <Label1 />
    </div>
  );
}

function Img6() {
  return (
    <div className="aspect-[464/240] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of brand logo incorrectly colored" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg6} />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon 3">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon 1">
          <path d={svgPaths.p180dff00} fill="var(--fill-0, #F20909)" />
          <path d="M5 4.79688L11.4 11.1969" id="Vector 4702" stroke="var(--stroke-0, white)" strokeWidth="2" />
          <path d={svgPaths.p94a600} id="Vector 4703" stroke="var(--stroke-0, white)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Label">
      <Icon3 />
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[13px] text-black tracking-[-0.13px]">
        <p className="css-ew64yg leading-[1.2]">Do not change the color of the mark alone</p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Item 3">
      <Img6 />
      <Label2 />
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Row 1">
      <Item />
      <Item1 />
      <Item2 />
    </div>
  );
}

function Img7() {
  return (
    <div className="aspect-[464/240] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of brand logo incorrectly outlined" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg7} />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon 1">
          <path d={svgPaths.p180dff00} fill="var(--fill-0, #F20909)" />
          <path d="M5 4.79688L11.4 11.1969" id="Vector 4702" stroke="var(--stroke-0, white)" strokeWidth="2" />
          <path d={svgPaths.p94a600} id="Vector 4703" stroke="var(--stroke-0, white)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Label3() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Label">
      <Icon />
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[13px] text-black tracking-[-0.13px]">
        <p className="css-ew64yg leading-[1.2]">Do not outline the logo</p>
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Item 1">
      <Img7 />
      <Label3 />
    </div>
  );
}

function Img8() {
  return (
    <div className="aspect-[464/240] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of brand logo incorrectly ordered" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg8} />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon 1">
          <path d={svgPaths.p180dff00} fill="var(--fill-0, #F20909)" />
          <path d="M5 4.79688L11.4 11.1969" id="Vector 4702" stroke="var(--stroke-0, white)" strokeWidth="2" />
          <path d={svgPaths.p94a600} id="Vector 4703" stroke="var(--stroke-0, white)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Label4() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Label">
      <Icon4 />
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[13px] text-black tracking-[-0.13px]">
        <p className="css-ew64yg leading-[1.2]">Do not reverse the lockup</p>
      </div>
    </div>
  );
}

function Item4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Item 2">
      <Img8 />
      <Label4 />
    </div>
  );
}

function Img9() {
  return (
    <div className="aspect-[464/240] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of brand logo incorrectly using gradients" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg9} />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon 1">
          <path d={svgPaths.p180dff00} fill="var(--fill-0, #F20909)" />
          <path d="M5 4.79688L11.4 11.1969" id="Vector 4702" stroke="var(--stroke-0, white)" strokeWidth="2" />
          <path d={svgPaths.p94a600} id="Vector 4703" stroke="var(--stroke-0, white)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Label5() {
  return (
    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full" data-name="Label">
      <Icon5 />
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[13px] text-black tracking-[-0.13px]">
        <p className="css-ew64yg leading-[1.2]">Do not add gradients the logo</p>
      </div>
    </div>
  );
}

function Item5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Item 3">
      <Img9 />
      <Label5 />
    </div>
  );
}

function Row4() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Row 2">
      <Item3 />
      <Item4 />
      <Item5 />
    </div>
  );
}

function Grid() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full" data-name="Grid">
      <Row3 />
      <Row4 />
    </div>
  );
}

function Diagram3() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Diagram 4">
      <SectionHeader4 />
      <Grid />
    </div>
  );
}

function SectionHeader5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[22px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2]">Partnerships</h3>
      </div>
    </div>
  );
}

function Img10() {
  return (
    <div className="aspect-[464/240] relative shrink-0 w-full" data-name="IMG">
      <img alt="Image of partnership logos" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg10} />
    </div>
  );
}

function Diagram4() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Diagram 5">
      <SectionHeader5 />
      <Img10 />
    </div>
  );
}

function LogoDiagrams() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-start relative shrink-0 w-full" data-name="Logo diagrams">
      <Diagram />
      <Diagram1 />
      <Diagram2 />
      <Diagram3 />
      <Diagram4 />
    </div>
  );
}

function LogoSection() {
  return (
    <section className="content-stretch flex flex-col items-center pb-[80px] pt-[88px] px-[32px] relative shrink-0 w-[800px]" data-name="Logo section">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <Header2 />
      <LogoDiagrams />
    </section>
  );
}

function Number2() {
  return <div className="flex-[1_0_0] h-full min-h-px min-w-px" data-name="Number" />;
}

function Title4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-end min-h-px min-w-px relative" data-name="Title">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.6px]">
        <h2 className="css-ew64yg leading-[1.1] text-[60px]">
          <span className="text-[#f45f00]">04</span>
          <span>{`  Color`}</span>
        </h2>
      </div>
      <div className="flex flex-[1_0_0] flex-row items-end self-stretch">
        <Number2 />
      </div>
    </div>
  );
}

function Header3() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Header">
      <Title4 />
      <div className="flex flex-[1_0_0] flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[1.2] min-h-px min-w-px relative text-[#575757] text-[0px] text-[15px] tracking-[-0.15px]">
        <p className="css-4hzbpn mb-0">Redo’s color palette is designed to evoke trust, reliability, and financial clarity, ensuring that every touchpoint reflects our commitment to accuracy and efficiency.</p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn">Together, these colors create a strong, dependable, and forward-thinking brand identity, ensuring that Redo is instantly recognized as the go-to solution for financial corrections and optimization.</p>
      </div>
    </div>
  );
}

function SectionHeader6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2] text-[22px]">Primary Palette</h3>
      </div>
    </div>
  );
}

function Img11() {
  return <div aria-label="Orange color swatch" className="bg-[#fa9819] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label6() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">{`Orange `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #FA9819</p>
      </div>
    </div>
  );
}

function Color() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 1">
      <Img11 />
      <Label6 />
    </div>
  );
}

function Img12() {
  return <div aria-label="Blue tint color swatch" className="bg-[#b6c9cf] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label7() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">{`Blue Tint `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #B6C9CF</p>
      </div>
    </div>
  );
}

function Color1() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 2">
      <Img12 />
      <Label7 />
    </div>
  );
}

function Img13() {
  return (
    <div aria-label="White color swatch" className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[100000px] w-full" data-name="IMG">
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[100000px]" />
    </div>
  );
}

function Label8() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">{`White `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #000000</p>
      </div>
    </div>
  );
}

function Color2() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 3">
      <Img13 />
      <Label8 />
    </div>
  );
}

function Img14() {
  return <div aria-label="Baby blue color swatch" className="bg-[#c6ebf7] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label9() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Baby Blue</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #C6EBF7</p>
      </div>
    </div>
  );
}

function Color3() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 4">
      <Img14 />
      <Label9 />
    </div>
  );
}

function Colors() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Colors">
      <Color />
      <Color1 />
      <Color2 />
      <Color3 />
    </div>
  );
}

function Primary() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start pb-0 pt-[40px] px-0 relative shrink-0 w-full" data-name="Primary">
      <SectionHeader6 />
      <Colors />
    </div>
  );
}

function SectionHeader7() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2] text-[22px]">Secondary Palette</h3>
      </div>
    </div>
  );
}

function Img15() {
  return <div aria-label="Navy color swatch" className="bg-[#1e3d59] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label10() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">{`Navy `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #1E3D59</p>
      </div>
    </div>
  );
}

function Color4() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 1">
      <Img15 />
      <Label10 />
    </div>
  );
}

function Img16() {
  return <div aria-label="Blue color swatch" className="bg-[#48749e] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label11() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">{`Caption `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #48749E</p>
      </div>
    </div>
  );
}

function Color5() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 2">
      <Img16 />
      <Label11 />
    </div>
  );
}

function Img17() {
  return <div aria-label="Sky blue color swatch" className="bg-[#deeefe] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label12() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">{`Sky Blue `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #DEEEFE</p>
      </div>
    </div>
  );
}

function Color6() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 3">
      <Img17 />
      <Label12 />
    </div>
  );
}

function Img18() {
  return <div aria-label="Off-blue color swatch" className="bg-[#e8ebef] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label13() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Off-blue</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #E8EBEF</p>
      </div>
    </div>
  );
}

function Color7() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 4">
      <Img18 />
      <Label13 />
    </div>
  );
}

function ColorRow() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Color row 1">
      <Color4 />
      <Color5 />
      <Color6 />
      <Color7 />
    </div>
  );
}

function Img19() {
  return <div aria-label="Deep orange color swatch" className="bg-[#f45f00] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label14() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">{`Deep Orange `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #CD4900</p>
      </div>
    </div>
  );
}

function Color8() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 1">
      <Img19 />
      <Label14 />
    </div>
  );
}

function Img20() {
  return <div aria-label="Black color swatch" className="bg-[#040404] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-[172px]" data-name="IMG" />;
}

function Label15() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">{`Black `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #000000</p>
      </div>
    </div>
  );
}

function Color9() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0" data-name="Color 2">
      <Img20 />
      <Label15 />
    </div>
  );
}

function Img21() {
  return <div aria-label="Dark grey color swatch" className="bg-[#a3a3a3] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label16() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Dark Grey</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #A3A3A3</p>
      </div>
    </div>
  );
}

function Color10() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 3">
      <Img21 />
      <Label16 />
    </div>
  );
}

function Img22() {
  return <div aria-label="Grey color swatch" className="bg-[#e5e5e5] flex-[1_0_0] min-h-px min-w-px rounded-[100000px] w-full" data-name="IMG" />;
}

function Label17() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[4px] items-start leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Grey</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Hex: #E5E5E5</p>
      </div>
    </div>
  );
}

function Color11() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-[218px] items-start relative shrink-0 w-[172px]" data-name="Color 4">
      <Img22 />
      <Label17 />
    </div>
  );
}

function ColorRow1() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Color row 2">
      <Color8 />
      <Color9 />
      <Color10 />
      <Color11 />
    </div>
  );
}

function Secondary() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Secondary">
      <SectionHeader7 />
      <ColorRow />
      <ColorRow1 />
    </div>
  );
}

function SectionHeader8() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2] text-[22px]">Gradient Palette</h3>
      </div>
    </div>
  );
}

function Img23() {
  return (
    <div className="aspect-[435/292.4830627441406] relative shrink-0 w-full" data-name="IMG">
      <img alt="Orange gradient with shades of blue" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg11} />
    </div>
  );
}

function Gradient() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Gradient 1">
      <Img23 />
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Gradient 1</p>
      </div>
    </div>
  );
}

function Img24() {
  return (
    <div className="aspect-[435/292.4830627441406] relative shrink-0 w-full" data-name="IMG">
      <img alt="Blue gradient with shades of orange" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg12} />
    </div>
  );
}

function Gradient1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Gradient 2">
      <Img24 />
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Gradient 2</p>
      </div>
    </div>
  );
}

function GradientRow() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Gradient row 1">
      <Gradient />
      <Gradient1 />
    </div>
  );
}

function Img25() {
  return (
    <div className="aspect-[435/292.4800109863281] relative shrink-0 w-full" data-name="IMG">
      <img alt="Gradient with shades of orange" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg13} />
    </div>
  );
}

function Gradient2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Gradient 1">
      <Img25 />
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Gradient 3</p>
      </div>
    </div>
  );
}

function Img26() {
  return (
    <div className="aspect-[435/292.4800109863281] relative shrink-0 w-full" data-name="IMG">
      <img alt="Gradient with shades of blue" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg14} />
    </div>
  );
}

function Gradient3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Gradient 2">
      <Img26 />
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.13px] w-full">
        <p className="css-4hzbpn leading-[1.2] text-[13px]">Gradient 4</p>
      </div>
    </div>
  );
}

function GradientRow1() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Gradient row 2">
      <Gradient2 />
      <Gradient3 />
    </div>
  );
}

function Gradients() {
  return (
    <div className="relative shrink-0 w-full" data-name="Gradients">
      <div className="content-stretch flex flex-col gap-[20px] items-start px-[32px] py-0 relative w-full">
        <SectionHeader8 />
        <GradientRow />
        <GradientRow1 />
      </div>
    </div>
  );
}

function ColorPalette() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-start pb-[120px] pt-0 px-0 relative shrink-0 w-full" data-name="Color palette">
      <Primary />
      <Secondary />
      <Gradients />
    </div>
  );
}

function ColorSection() {
  return (
    <section className="content-stretch flex flex-col gap-[30px] items-start pb-0 pt-[32px] px-[32px] relative shrink-0 w-[800px]" data-name="Color section">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-l border-solid border-t inset-0 pointer-events-none" />
      <Header3 />
      <ColorPalette />
    </section>
  );
}

function Number3() {
  return <div className="flex-[1_0_0] h-full min-h-px min-w-px" data-name="Number" />;
}

function Title5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-end min-h-px min-w-px relative" data-name="Title">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[60px] text-black tracking-[-0.6px]">
        <h2 className="css-ew64yg leading-[1.1]">
          <span className="text-[#f45f00]">05</span>
          <span>{`  Typography`}</span>
        </h2>
      </div>
      <div className="flex flex-[1_0_0] flex-row items-end self-stretch">
        <Number3 />
      </div>
    </div>
  );
}

function Img27() {
  return (
    <div className="aspect-[352/300] relative shrink-0 w-full" data-name="IMG">
      <img alt="Large letters in brand typography" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg15} />
    </div>
  );
}

function Content3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[40px] items-start justify-center min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#575757] text-[15px] tracking-[-0.15px] w-full">
        <p className="css-4hzbpn leading-[1.2]">Redo’s typography balances clarity and professionalism with a modern yet timeless type pairing, reinforcing our commitment to accuracy, efficiency, and financial stability.</p>
      </div>
      <Img27 />
      <div className="flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[1.2] relative shrink-0 text-[#575757] text-[0px] text-[15px] tracking-[-0.15px] w-full">
        <p className="css-4hzbpn mb-0">
          <span>{`Primary Sans-Serif `}</span>
          <span className="font-['Rethink_Sans:Medium',sans-serif] font-medium text-[#f45f00] tracking-[-0.15px]">(Rethink Sans Reg)</span>
          <span>{` is a clean, modern sans-serif typeface that ensures legibility and precision across all digital and print materials. Its geometric structure reflects clarity, efficiency, and trust, making it the ideal choice for data-heavy content, dashboards, and user interfaces.`}</span>
        </p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn mb-0">
          <span>{`Secondary Serif `}</span>
          <span className="font-['Rethink_Sans:Medium',sans-serif] font-medium text-[#f45f00] tracking-[-0.15px]">(Hedvig Letters Serif)</span>
          <span>{` is a refined, authoritative serif font that adds a touch of tradition and credibility. Used for emphasis in headlines, reports, and financial documents, it reinforces Redo’s expertise and reliability in correcting financial discrepancies.`}</span>
        </p>
        <p className="css-4hzbpn mb-0">&nbsp;</p>
        <p className="css-4hzbpn">This sans-serif and serif combination creates a dynamic contrast—modern yet trustworthy, analytical yet approachable, ensuring Redo’s brand communication is always clear, professional, and dependable.</p>
      </div>
    </div>
  );
}

function Header4() {
  return (
    <div className="content-stretch flex gap-[32px] items-start pb-[40px] pt-0 px-0 relative shrink-0 w-full" data-name="Header">
      <Title5 />
      <Content3 />
    </div>
  );
}

function Primary1() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Primary">
      <p className="css-4hzbpn font-['Rethink_Sans:Medium',sans-serif] font-medium leading-[1.2] relative shrink-0 text-[15px] tracking-[-0.3px] w-full">Primary Typeface</p>
      <p className="css-4hzbpn font-['Rethink_Sans:Regular',sans-serif] font-normal leading-[1.3] relative shrink-0 text-[60px] tracking-[-1.2px] w-full">Rethink Sans Reg</p>
    </div>
  );
}

function Secondary1() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Secondary">
      <p className="css-4hzbpn font-['Rethink_Sans:Medium',sans-serif] font-medium leading-[1.2] relative shrink-0 text-[15px] tracking-[-0.3px] w-full">Secondary Typeface</p>
      <p className="css-4hzbpn font-['Hedvig_Letters_Serif:Regular',sans-serif] leading-[1.3] not-italic relative shrink-0 text-[60px] tracking-[-1.2px] w-full">Hedvig Letters Serif</p>
    </div>
  );
}

function Styles() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 text-black w-full" data-name="Styles">
      <Primary1 />
      <Secondary1 />
    </div>
  );
}

function Description() {
  return (
    <div className="content-stretch flex font-['Rethink_Sans:Medium',sans-serif] font-medium h-[13px] items-start justify-between leading-[1.2] relative shrink-0 text-[#575757] text-[13px] tracking-[-0.13px] w-full" data-name="Description">
      <p className="css-ew64yg relative shrink-0">Type Sizes 0–24pt/px</p>
      <p className="css-ew64yg relative shrink-0">130% Leading</p>
      <p className="css-ew64yg relative shrink-0">0% Tracking</p>
    </div>
  );
}

function Content4() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start pb-[10px] pt-0 px-0 relative shrink-0 w-full" data-name="Content">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <p className="css-4hzbpn font-['Hedvig_Letters_Serif:Regular',sans-serif] leading-[1.3] not-italic relative shrink-0 text-[14px] text-black w-[517px]">Financial errors shouldn’t slow you down or cause unnecessary stress. Whether it’s an incorrect charge, a duplicate transaction, or a miscalculated fee, we step in to make things right. Our process is simple, straightforward, and designed to get your money back where it belongs—quickly and without hassle.</p>
      <Description />
    </div>
  );
}

function Sizing4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Sizing 4">
      <div className="content-stretch flex flex-col items-start pl-0 pr-[32px] py-[30px] relative w-full">
        <Content4 />
      </div>
    </div>
  );
}

function Description1() {
  return (
    <div className="content-stretch flex font-['Rethink_Sans:Medium',sans-serif] font-medium h-[13px] items-start justify-between leading-[1.2] relative shrink-0 text-[#575757] text-[13px] tracking-[-0.13px] w-full" data-name="Description">
      <p className="css-ew64yg relative shrink-0">Type Sizes 24–55pt/px</p>
      <p className="css-ew64yg relative shrink-0">120% Leading</p>
      <p className="css-ew64yg relative shrink-0">-1% Tracking</p>
    </div>
  );
}

function Content5() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start px-0 py-[10px] relative shrink-0 w-full" data-name="Content">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <p className="css-4hzbpn font-['Rethink_Sans:Regular',sans-serif] font-normal leading-[1.2] relative shrink-0 text-[20px] text-black tracking-[-0.2px] w-[505.068px]">Our team works diligently to recover lost funds, correct inaccuracies, and keep your financial records accurate—so you can feel confident about every dollar in your account.</p>
      <Description1 />
    </div>
  );
}

function Sizing3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Sizing 3">
      <div className="content-stretch flex flex-col items-start pl-0 pr-[32px] py-[30px] relative w-full">
        <Content5 />
      </div>
    </div>
  );
}

function Description2() {
  return (
    <div className="content-stretch flex font-['Rethink_Sans:Medium',sans-serif] font-medium h-[13px] items-start justify-between leading-[1.2] relative shrink-0 text-[#575757] text-[13px] tracking-[-0.13px] w-full" data-name="Description">
      <p className="css-ew64yg relative shrink-0">Type Sizes 55–72pt/px</p>
      <p className="css-ew64yg relative shrink-0">110% Leading</p>
      <p className="css-ew64yg relative shrink-0">-2% Tracking</p>
    </div>
  );
}

function Content6() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start px-0 py-[10px] relative shrink-0 w-full" data-name="Content">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <p className="css-4hzbpn font-['Rethink_Sans:Regular',sans-serif] font-normal leading-[1.1] relative shrink-0 text-[32px] text-black tracking-[-0.64px] w-[654px]">Whether it’s a bank error, an unauthorized charge, or an overlooked refund, we ensure you don’t pay for something you shouldn’t have.</p>
      <Description2 />
    </div>
  );
}

function Sizing2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Sizing 2">
      <div className="content-stretch flex flex-col items-start pl-0 pr-[32px] py-[30px] relative w-full">
        <Content6 />
      </div>
    </div>
  );
}

function Description3() {
  return (
    <div className="content-stretch flex font-['Rethink_Sans:Medium',sans-serif] font-medium h-[13px] items-start justify-between leading-[1.2] relative shrink-0 text-[#575757] text-[13px] tracking-[-0.13px] w-full" data-name="Description">
      <p className="css-ew64yg relative shrink-0">{`Type Sizes > 72pt/px`}</p>
      <p className="css-ew64yg relative shrink-0">100% Leading</p>
      <p className="css-ew64yg relative shrink-0">-2% Tracking</p>
    </div>
  );
}

function Content7() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start pb-[10px] pt-0 px-0 relative shrink-0 w-full" data-name="Content">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <p className="css-4hzbpn font-['Rethink_Sans:Regular',sans-serif] font-normal leading-[1.1] relative shrink-0 text-[50px] text-black tracking-[-1px] w-[546px]">Clear Up Confusion, Gain Peace of Mind</p>
      <Description3 />
    </div>
  );
}

function Sizing1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Sizing 1">
      <div className="content-stretch flex flex-col items-start pl-0 pr-[32px] py-[30px] relative w-full">
        <Content7 />
      </div>
    </div>
  );
}

function SectionHeader9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="Section header">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[22px] text-black tracking-[-0.22px]">
        <h3 className="block css-ew64yg leading-[1.2]">Sizing</h3>
      </div>
    </div>
  );
}

function Header5() {
  return (
    <div className="content-stretch flex gap-[32px] items-start pb-[40px] pt-[32px] px-0 relative shrink-0 w-full" data-name="Header">
      <SectionHeader9 />
      <div className="flex flex-[1_0_0] flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#575757] text-[15px] tracking-[-0.15px]">
        <p className="css-4hzbpn leading-[1.2]">{`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. `}</p>
      </div>
    </div>
  );
}

function Sizing() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Sizing">
      <Sizing4 />
      <Sizing3 />
      <Sizing2 />
      <Sizing1 />
      <Header5 />
    </div>
  );
}

function TypeStyles() {
  return (
    <div className="content-stretch flex flex-col gap-[100px] items-start relative shrink-0 w-full" data-name="Type styles">
      <Styles />
      <Sizing />
    </div>
  );
}

function TypographySection() {
  return (
    <section className="content-stretch flex flex-col items-start pb-0 pt-[88px] px-[32px] relative shrink-0 w-[800px]" data-name="Typography Section">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <Header4 />
      <TypeStyles />
    </section>
  );
}

function Number4() {
  return <div className="flex-[1_0_0] h-full min-h-px min-w-px" data-name="Number" />;
}

function Title6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-end min-h-px min-w-px relative" data-name="Title">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[60px] text-black tracking-[-0.6px]">
        <h2 className="css-ew64yg leading-[1.1]">
          <span className="text-[#f45f00]">06</span>
          <span>{`  Art Direction`}</span>
        </h2>
      </div>
      <div className="flex flex-[1_0_0] flex-row items-end self-stretch">
        <Number4 />
      </div>
    </div>
  );
}

function Header6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex gap-[32px] items-start pb-0 pt-[20px] px-[32px] relative w-full">
        <Title6 />
        <div className="flex flex-[1_0_0] flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#575757] text-[15px] tracking-[-0.15px]">
          <p className="css-4hzbpn leading-[1.2]">Redo’s photography style reinforces our brand’s core values—trust, clarity, and financial empowerment—by showcasing visuals that reflect professionalism, accuracy, and control.</p>
        </div>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="aspect-[467/295.36260986328125] relative shrink-0 w-full" data-name="Image 1">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="Person sitting on floor working on laptop" className="absolute h-[105.41%] left-0 max-w-none top-[-5.41%] w-full" src={imgImage1} />
      </div>
    </div>
  );
}

function Description4() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[8px] items-start leading-[0] relative shrink-0 text-[13px] tracking-[-0.13px] w-full" data-name="Description">
      <div className="flex flex-col justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">{`Clean & Casual`}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">Photography should feature modern, well-lit workspaces with a clean and organized feel. The focus should be on clarit, avoiding clutter or overly dramatic compositions.</p>
      </div>
    </div>
  );
}

function Image2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Image 1">
      <Image />
      <Description4 />
    </div>
  );
}

function Image1() {
  return (
    <div className="aspect-[467/295.36260986328125] relative shrink-0 w-full" data-name="Image 2">
      <img alt="Person sitting by window working on tablet" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
    </div>
  );
}

function Description5() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[8px] items-start leading-[0] relative shrink-0 text-[13px] tracking-[-0.13px] w-full" data-name="Description">
      <div className="flex flex-col justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">Subtle Technology Integration</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">Photography should include elements of financial technology—computer screens displaying dashboards, tablets with data analytics, or hands interacting with financial tools—to highlight Redo’s tech-driven approach to error correction.</p>
      </div>
    </div>
  );
}

function Image3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Image 2">
      <Image1 />
      <Description5 />
    </div>
  );
}

function Row5() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Row 1">
      <Image2 />
      <Image3 />
    </div>
  );
}

function Image4() {
  return (
    <div className="aspect-[467/295.36260986328125] relative shrink-0 w-full" data-name="Image 1">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="Person sitting on couch working on laptop" className="absolute h-[125%] left-[-14.07%] max-w-none top-[-11.51%] w-[123.38%]" src={imgImage3} />
      </div>
    </div>
  );
}

function Description6() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[8px] items-start leading-[0] relative shrink-0 text-[13px] tracking-[-0.13px] w-full" data-name="Description">
      <div className="flex flex-col justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">{`Financial Storytelling `}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">Images should capture real-world financial scenarios—professionals analyzing reports, business owners reviewing balance sheets, and teams discussing financial strategies. This reinforces Redo’s role in helping businesses take control of their finances.</p>
      </div>
    </div>
  );
}

function Image5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Image 1">
      <Image4 />
      <Description6 />
    </div>
  );
}

function Image6() {
  return (
    <div className="aspect-[467/295.36260986328125] relative shrink-0 w-full" data-name="Image 2">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="Person at standing desk working on laptop" className="absolute h-[151.08%] left-[-38.22%] max-w-none top-[-25.54%] w-[143.72%]" src={imgImage4} />
      </div>
    </div>
  );
}

function Description7() {
  return (
    <div className="content-stretch flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[8px] items-start leading-[0] relative shrink-0 text-[13px] tracking-[-0.13px] w-full" data-name="Description">
      <div className="flex flex-col justify-center relative shrink-0 text-black w-full">
        <p className="css-4hzbpn leading-[1.2]">{`People with Confidence & Focus`}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#575757] w-full">
        <p className="css-4hzbpn leading-[1.2]">Images should capture real-world financial scenarios—professionals analyzing reports, business owners reviewing balance sheets, and teams discussing financial strategies. This reinforces Redo’s role in helping businesses take control of their finances.</p>
      </div>
    </div>
  );
}

function Image7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px relative" data-name="Image 2">
      <Image6 />
      <Description7 />
    </div>
  );
}

function Row6() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Row 2">
      <Image5 />
      <Image7 />
    </div>
  );
}

function PhotoGrid() {
  return (
    <div className="relative shrink-0 w-full" data-name="Photo grid">
      <div className="content-stretch flex flex-col gap-[40px] items-start px-[32px] py-0 relative w-full">
        <Row5 />
        <Row6 />
      </div>
    </div>
  );
}

function ArtDirectionSection() {
  return (
    <section className="content-stretch flex flex-col gap-[65px] items-start pb-[8px] pt-[88px] px-0 relative shrink-0 w-[800px]" data-name="Art Direction Section">
      <Header6 />
      <PhotoGrid />
    </section>
  );
}

function Main() {
  return (
    <main className="content-stretch flex flex-col items-start overflow-clip p-0 relative shrink-0 w-full" data-name="Main" tabIndex="-1">
      <IntroSection />
      <TableOfContents />
      <StrategySection />
      <PersonalitySection />
      <LogoSection />
      <ColorSection />
      <TypographySection />
      <ArtDirectionSection />
    </main>
  );
}

function Group() {
  return (
    <div className="absolute h-[80.999px] left-0 top-0 w-[349.12px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 349.12 80.9993">
        <g id="Logo">
          <g id="Redo">
            <path d={svgPaths.p9d8f800} fill="var(--fill-0, black)" id="Vector" />
            <path d={svgPaths.p3c692d80} fill="var(--fill-0, black)" id="Vector_2" />
            <path d={svgPaths.p186e39b2} fill="var(--fill-0, black)" id="Vector_3" />
            <path d={svgPaths.p17dccd00} fill="var(--fill-0, black)" id="Vector_4" />
          </g>
          <path clipRule="evenodd" d={svgPaths.p3c04b780} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector 2669 (Stroke)" />
          <path clipRule="evenodd" d={svgPaths.p1122e500} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector 2670 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div aria-label="Redo company logo" className="h-[80.998px] relative shrink-0 w-[349.125px]" data-name="Logo">
      <Group />
    </div>
  );
}

function BackToTheTop() {
  return (
    <button className="content-stretch cursor-pointer flex items-start p-0 relative shrink-0" data-name="Back to the top">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[15px] text-black text-left tracking-[-0.3px]">
        <p className="css-ew64yg leading-[1.2]">Back to the top</p>
      </div>
    </button>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex gap-[51px] items-start relative shrink-0" data-name="Text">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.3px]">
        <a className="block css-ew64yg cursor-pointer leading-[1.2] text-[15px]" href="https://www.figma.com/sites">
          Download Kit
        </a>
      </div>
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[0px] text-black tracking-[-0.3px]">
        <a className="block css-ew64yg cursor-pointer leading-[1.2] text-[15px]" href="https://www.figma.com/sites">
          Contact Us
        </a>
      </div>
      <BackToTheTop />
    </div>
  );
}

function Content8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Content">
      <div className="flex flex-col justify-end size-full">
        <div className="content-stretch flex flex-col gap-[59px] items-start justify-end px-[40px] py-0 relative w-full">
          <Logo />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Legal() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative" data-name="Legal">
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:SemiBold',sans-serif] font-semibold justify-center relative shrink-0 text-[13px] tracking-[-0.26px]">
        <p className="css-ew64yg leading-[1.2]">© Redo</p>
      </div>
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[0px] tracking-[-0.13px]">
        <a className="block css-ew64yg cursor-pointer leading-[1.2] text-[13px]" href="https://figma.com/sites">
          Legal
        </a>
      </div>
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[0px] tracking-[-0.13px]">
        <a className="block css-ew64yg cursor-pointer leading-[1.2] text-[13px]" href="https://figma.com/sites">
          Privacy
        </a>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex gap-[16px] items-start leading-[0] relative shrink-0 text-black w-full" data-name="Text">
      <Legal />
      <div className="css-g0mm18 flex flex-col font-['Rethink_Sans:Medium',sans-serif] font-medium justify-center relative shrink-0 text-[13px] tracking-[-0.13px]">
        <p className="css-ew64yg leading-[1.2]">All Rights Reserved</p>
      </div>
    </div>
  );
}

function Content9() {
  return (
    <div className="relative shrink-0 w-full" data-name="Content">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-col justify-end size-full">
        <div className="content-stretch flex flex-col items-start justify-end pb-[20px] pt-[40px] px-[40px] relative w-full">
          <Text2 />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="content-stretch flex flex-col h-[430.998px] items-start justify-between pb-[32px] pt-[128px] px-0 relative shrink-0 w-full" data-name="Footer">
      <Content8 />
      <Content9 />
    </footer>
  );
}

function Main1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Main">
      <Hero />
      <Main />
      <Footer />
    </div>
  );
}

function TopLinks() {
  return (
    <div className="content-stretch flex flex-[1_0_0] font-['Rethink_Sans:Medium',sans-serif] font-medium gap-[12px] items-start justify-end leading-[0] min-h-px min-w-px relative text-[#575757] text-[13px] tracking-[-0.13px]" data-name="Top links">
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0">
        <p className="css-ew64yg leading-[1.2]">Download Kit</p>
      </div>
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0">
        <p className="css-ew64yg leading-[1.2]">Contact Us</p>
      </div>
    </div>
  );
}

function Logo1() {
  return (
    <div aria-label="Redo company logo" className="content-stretch flex gap-[8px] items-start justify-end px-0 py-[14px] relative shrink-0 w-full" data-name="Logo">
      <div className="h-[11.832px] relative shrink-0 w-[51.006px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 51.0057 11.8322">
          <g id="Vector">
            <path d={svgPaths.p3126f100} fill="var(--fill-0, black)" />
            <path d={svgPaths.p308ec1c0} fill="var(--fill-0, black)" />
            <path d={svgPaths.p5121b00} fill="var(--fill-0, black)" />
            <path d={svgPaths.pa537700} fill="var(--fill-0, black)" />
            <path clipRule="evenodd" d={svgPaths.p2ab43780} fill="var(--fill-0, black)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p6021180} fill="var(--fill-0, black)" fillRule="evenodd" />
          </g>
        </svg>
      </div>
      <TopLinks />
    </div>
  );
}

function NavLabels() {
  return (
    <button className="content-stretch flex items-start p-0 relative shrink-0" data-name="Nav labels 1">
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[15px] text-black tracking-[-0.3px]">
        <p className="css-ew64yg leading-[1.2]">Brand Strategy</p>
      </div>
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[#575757] text-[10px] tracking-[-0.2px]">
        <p className="css-ew64yg leading-[1.2]">01</p>
      </div>
    </button>
  );
}

function NavLabels1() {
  return (
    <button className="content-stretch flex items-start p-0 relative shrink-0" data-name="Nav labels 2">
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[15px] text-black tracking-[-0.3px]">
        <p className="css-ew64yg leading-[1.2]">Personality</p>
      </div>
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[#575757] text-[10px] tracking-[-0.2px]">
        <p className="css-ew64yg leading-[1.2]">02</p>
      </div>
    </button>
  );
}

function NavLabels2() {
  return (
    <button className="content-stretch flex items-start p-0 relative shrink-0" data-name="Nav labels 3">
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[15px] text-black tracking-[-0.3px]">
        <p className="css-ew64yg leading-[1.2]">Logo</p>
      </div>
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[#575757] text-[10px] tracking-[-0.2px]">
        <p className="css-ew64yg leading-[1.2]">03</p>
      </div>
    </button>
  );
}

function NavLabels3() {
  return (
    <button className="content-stretch flex items-start p-0 relative shrink-0" data-name="Nav labels 4">
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[15px] text-black tracking-[-0.3px]">
        <p className="css-ew64yg leading-[1.2]">Color</p>
      </div>
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[#575757] text-[10px] tracking-[-0.2px]">
        <p className="css-ew64yg leading-[1.2]">04</p>
      </div>
    </button>
  );
}

function NavLabels4() {
  return (
    <button className="content-stretch flex items-start p-0 relative shrink-0" data-name="Nav labels 5">
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[15px] text-black tracking-[-0.3px]">
        <p className="css-ew64yg leading-[1.2]">Typography</p>
      </div>
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[#575757] text-[10px] tracking-[-0.2px]">
        <p className="css-ew64yg leading-[1.2]">05</p>
      </div>
    </button>
  );
}

function NavLabels5() {
  return (
    <button className="content-stretch flex items-start p-0 relative shrink-0" data-name="Nav labels 6">
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[15px] text-black tracking-[-0.3px]">
        <p className="css-ew64yg leading-[1.2]">Art Direction</p>
      </div>
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0 text-[#575757] text-[10px] tracking-[-0.2px]">
        <p className="css-ew64yg leading-[1.2]">06</p>
      </div>
    </button>
  );
}

function Labels() {
  return (
    <div className="content-stretch cursor-pointer flex font-['Rethink_Sans:Medium',sans-serif] font-medium items-start justify-between leading-[0] relative shrink-0 text-left w-full" data-name="Labels">
      <NavLabels />
      <NavLabels1 />
      <NavLabels2 />
      <NavLabels3 />
      <NavLabels4 />
      <NavLabels5 />
    </div>
  );
}

function Contents() {
  return (
    <div className="content-stretch flex flex-col items-start px-0 py-[14px] relative shrink-0 w-full" data-name="Contents">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <Labels />
    </div>
  );
}

function Content10() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Content">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[32px] py-0 relative w-full">
          <Logo1 />
          <Contents />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Navigation() {
  return (
    <nav className="absolute bg-white content-stretch flex items-start left-0 p-0 right-0 top-0" data-name="Navigation">
      <Content10 />
    </nav>
  );
}

export default function Tablet() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start justify-center relative size-full" data-name="Tablet">
      <Main1 />
      <Navigation />
    </div>
  );
}