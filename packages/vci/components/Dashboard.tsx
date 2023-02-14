import AssetSelection from "./sections/AssetSelection";
import FeeConfiguration from "./sections/FeeConfiguration";
import ProtocolSelection from "./sections/ProtocolSelection";

function Dashboard() {
  return (
    <section>
      <h1 className="text-2xl font-bold">VCI - Dashboard</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <ProtocolSelection />
        <AssetSelection />
        <FeeConfiguration />
      </form>
    </section>
  );
}

export default Dashboard;
