// ChatBotWidget.jsx
import React, { useEffect } from 'react';

const ChatBotWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <df-messenger
      intent="WELCOME"
      chat-title="LearnSphere Assistant"
      agent-id="925aa111-1d36-448f-8f96-821e1be50cd9"
      language-code="en"
    ></df-messenger>
  );
};

export default ChatBotWidget;
