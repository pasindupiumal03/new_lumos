import Sidebar from "./Sidebar";
export default function NewsSentiment() {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar selected="News Sentiment" />
      <main className="flex-1 p-8">
        <h1 className="font-druk text-4xl mb-8">News Sentiment Analysis</h1>
        <div className="bg-white/5 rounded-lg shadow-md p-6">
          <div className="text-gray-400">News sentiment analysis coming soon...</div>
        </div>
      </main>
    </div>
  );
}
