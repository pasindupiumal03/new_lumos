import Sidebar from "./Sidebar";
export default function SolanaEco() {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar selected="Solana Eco" />
      <main className="flex-1 p-8">
        <h1 className="font-druk text-4xl mb-8">Solana Ecosystem</h1>
        <div className="bg-white/5 rounded-lg shadow-md p-6">
          <div className="text-gray-400">Solana ecosystem analytics coming soon...</div>
        </div>
      </main>
    </div>
  );
}
