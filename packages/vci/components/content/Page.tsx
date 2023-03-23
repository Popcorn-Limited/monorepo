import Navbar from "./Navbar";

export default function Page({ children }: { children: JSX.Element }): JSX.Element {
  return (
    <>
      <Navbar />
      <main className="max-w-screen-lg mx-auto py-4">
        {children}
      </main>
    </>
  )
}