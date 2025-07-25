// Simple web search utility using DuckDuckGo Instant Answer API
// This provides basic search functionality for current information

export async function searchWeb(query: string): Promise<string | null> {
  try {
    // Use DuckDuckGo Instant Answer API (free, no API key required)
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = await response.json();
    
    // Check for instant answer
    if (data.AbstractText) {
      return data.AbstractText;
    }
    
    // Check for definition
    if (data.Definition) {
      return data.Definition;
    }
    
    // Check for answer
    if (data.Answer) {
      return data.Answer;
    }
    
    return null;
  } catch (error) {
    console.error('Web search error:', error);
    return null;
  }
}

// Enhanced response generator with optional web search
export async function generateResponseWithSearch(message: string, conversationHistory: string[] = []): Promise<string> {
  // Check if message might benefit from web search
  const searchTriggers = [
    'what time', 'what date', 'current', 'latest', 'recent', 'news', 'today', 
    'what\'s happening', 'weather', 'stock', 'price', 'when is', 'what year'
  ];
  
  const needsSearch = searchTriggers.some(trigger => 
    message.toLowerCase().includes(trigger)
  );
  
  let searchResult = '';
  if (needsSearch) {
    const webInfo = await searchWeb(message);
    if (webInfo) {
      searchResult = `\n\nCurrent information: ${webInfo}`;
    }
  }
  
  // Add search result to conversation context if available
  const enhancedMessage = searchResult ? `${message}${searchResult}` : message;
  
  return enhancedMessage;
}
