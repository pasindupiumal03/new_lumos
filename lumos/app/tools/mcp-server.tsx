import Sidebar from "./Sidebar";
export default function MCPServer() {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar selected="MCP Server" />
      <main className="flex-1 p-8">
        <h1 className="font-druk text-4xl mb-8">MCP Server</h1>
        <div className="bg-white/5 rounded-lg shadow-md p-6">
          <div className="text-gray-400">MCP Server functionality coming soon...</div>
        </div>
      </main>
    </div>
  );
}
