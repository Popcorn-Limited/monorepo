import Carousel from "./Carousel";


export default function AuditSection() {

  return (
    <section className="md:p-8 p-0 mt-44 flex flex-col items-start w-screen xl:max-w-[1800px] xl:mx-auto">
      <div className="flex-row w-full h-full gap-x-9 md:flex hidden">
        <div className="w-full flex-col flex">
          <p className="text-7xl mb-4">Audited</p>
          <p className="text-primaryDark">Our smart contract has been audited by the best in the business.</p>
        </div>
        <div className="w-full flex-col flex">
          <div className="w-[100%] pb-[100%] relative flex flex-col justify-center items-center rounded-lg bg-[#FA5A6E] mb-6">
            <img src="/images/icons/blocksec-logo.png" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
          </div>
          <p className="text-4xl mb-4">BlockSec</p>
          <p className="text-primaryDark">Zokyo is an end-to-end security resource that provides distinguishable security auditing and penetration testing services alongside prominent vulnerability assessments.</p>
        </div>
        <div className="w-full flex-col flex">

          <div className="w-[100%] pb-[100%] relative flex flex-col justify-center items-center rounded-lg bg-[#9B55FF] mb-6">
            <img src="/images/icons/c4-logo.png" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
          </div>
          <p className="text-4xl mb-4">Code4rena</p>
          <p className="text-primaryDark">Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
        </div>
        <div className="w-full flex-col flex">

          <div className="w-[100%] pb-[100%] relative flex flex-col justify-center items-center rounded-lg bg-[#05BE64] mb-6">
            <img src="/images/icons/immunifi-logo.png" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
          </div>
          <p className="text-4xl mb-4">Immunefi</p>
          <p className="text-primaryDark">Immunefi is the leading bug bounty platform for Web3.</p>

        </div>
      </div>
      {/* Mobile Section */}
      <div className="md:hidden flex flex-col items-center relative w-full">
        <div className="w-full flex-col flex px-6">
          <p className="text-7xl mb-4">Audited</p>
          <p className="text-lg mb-6">Our smart contract has been audited by the best in the business.</p>
        </div>
        <div className="w-full self-center h-full block-inline flex-col">
          <Carousel />
        </div>
      </div>
    </section>
  )
}