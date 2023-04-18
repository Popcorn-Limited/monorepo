import Link from "next/link";
import React from "react";

const descriptions = {
  zokyo: (
    <>
      {" "}
      Zokyo is an end-to-end security resource that provides distinguishable security auditing and penetration testing
      services alongside prominent vulnerability assessments.{" "}
      <Link
        href="https://assets.website-files.com/5f99eb79d508ca853be5f2e8/61b21474b7a1746d889f599d_Popcorn%20SC%20Audit.pdf"
        className="text-customPurple"
      >
        See Zokyo&apos;s review.
      </Link>
    </>
  ),
  immunefi: (
    <>
      Immunefi is a leading bug bounty platform for Web3 where hundreds of security researchers review smart contracts
      for vulnerabilites.{" "}
      <Link href="https://immunefi.com/bounty/popcornnetwork/" className="text-customPurple">
        See Popcorn&apos;s bug bounty program.
      </Link>
    </>
  ),
};
const SecuritySection = () => {
  return (
    <section className="grid grid-cols-12 md:gap-14 pt-10">
      <div className="col-span-12 md:col-span-3 hidden md:block">
        <div>
          <h1 className="text-4xl leading-12 pt-10">Security</h1>
          <p className="mt-4 text-primaryDark">
            Smart contracts are inherently risky and may contain bugs or vulnerabilities. Users should exercise caution
            when interacting with smart contracts and use at their own risk.
          </p>
        </div>
      </div>
      <div className="col-span-12 md:col-span-9 hidden md:grid grid-cols-3 gap-8 laptop:gap-14 mt-9">
        <div className="col-span-3 md:col-span-1">
          <p className="text-black text-3xl leading-9 mt-6 mb-4">Immunefi</p>
          <p className="text-primaryDark leading-5">{descriptions.immunefi}</p>
        </div>
      </div>
      <div className="col-span-12 md:hidden mt-9">
        <div>
          <h1 className="text-4xl leading-12 pt-10">Security</h1>
          <p className="mt-4 text-primaryDark">
            Smart contracts are inherently risky and may contain bugs or vulnerabilities. Users should exercise caution
            when interacting with smart contracts and use at their own risk.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
