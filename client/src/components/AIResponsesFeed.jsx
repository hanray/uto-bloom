import './AIResponsesFeed.css';

/**
 * AIResponsesFeed - Shows last 10 AI responses with timestamps
 * Newest at top, scrollable, fading older items
 */
function AIResponsesFeed({ responses = [], onClose }) {
  if (responses.length === 0) {
    return (
      <div className="ai-feed">
        <div className="ai-feed-empty">
          <span className="ai-feed-empty-icon">🤖</span>
          <p className="ai-feed-empty-text">AI Assistant responses will appear here</p>
          <p className="ai-feed-empty-subtext">Activate the AI Assistant to start analyzing your plant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-feed">
      <div className="ai-feed-list">
        {responses.map((response, index) => (
          <div 
            key={response.id || index} 
            className={`ai-feed-item ${index >= 7 ? 'faded' : ''}`}
          >
            <div className="ai-feed-item-header">
              <span className="ai-feed-item-icon">
                {response.type === 'analysis' ? '🔍' : 
                 response.type === 'health' ? '💚' : 
                 response.type === 'issue' ? '⚠️' : 
                 response.type === 'info' ? 'ℹ️' : '🤖'}
              </span>
              <span className="ai-feed-item-time">
                {new Date(response.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
            <p className="ai-feed-item-text">{response.message}</p>
            {response.confidence && (
              <div className="ai-feed-item-confidence">
                <div className="ai-feed-confidence-bar">
                  <div 
                    className="ai-feed-confidence-fill" 
                    style={{ width: `${response.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="ai-feed-confidence-text">
                  {(response.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIResponsesFeed;
