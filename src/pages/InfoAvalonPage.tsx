import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { avalonData, InfoAvalonItem } from '../data/infoAvalonData';
import { PaperAirplaneIcon, UserIcon as AvatarUserIcon, PaperClipIcon, PhotographIcon, HelpCircleIcon, DocumentTextIcon } from '../components/icons/Icons'; // Renamed UserIcon to avoid conflict if Page had a UserIcon

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string | React.ReactNode;
  timestamp: Date;
}

const InfoAvalonPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message from the bot
    setChatHistory([
      {
        id: uuidv4(),
        type: 'bot',
        content: "Bienvenido al manual interactivo de Avalon, pregunta como se hace cualquier tarea y trataré de responderla",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setInputValue('');
    processUserQuery(trimmedInput);
  };

  const handleTitleClick = (title: string) => {
    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: title,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    processUserQuery(title);
  };


  const processUserQuery = (query: string) => {
    const lowerQuery = query.toLowerCase().trim();
    let botResponseContent: React.ReactNode;

    if (lowerQuery === 'ver todo') {
      botResponseContent = (
        <div className="space-y-3">
          <p>Aquí tienes la lista completa de temas disponibles. Haz clic en uno para ver los detalles:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {avalonData.map(item => (
              <button
                key={item.id}
                onClick={() => handleTitleClick(item.title)}
                className="group bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-4 text-left w-full"
              >
                {item.type === 'pdf' && <PaperClipIcon className="w-7 h-7 text-red-500 flex-shrink-0" />}
                {item.type === 'text' && <DocumentTextIcon className="w-7 h-7 text-blue-500 flex-shrink-0" />}
                {item.type === 'image' && <PhotographIcon className="w-7 h-7 text-green-500 flex-shrink-0" />}
                <span className="font-medium text-sm text-gray-800 group-hover:text-indigo-600 transition-colors">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      );
    } else {
      const results = avalonData.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const keywordMatch = item.keywords.some(kw => kw.toLowerCase().includes(lowerQuery) || lowerQuery.includes(kw.toLowerCase()));
        const contentMatch = typeof item.content === 'string' && item.type === 'text' && item.content.toLowerCase().includes(lowerQuery);
        const descriptionMatch = typeof item.description === 'string' && item.description.toLowerCase().includes(lowerQuery);
        return titleMatch || keywordMatch || contentMatch || descriptionMatch;
      });

      if (results.length > 0) {
        botResponseContent = (
          <div className="space-y-4">
            <p>He encontrado {results.length} resultado(s) para tu consulta:</p>
            <div className="space-y-4">
              {results.map(item => (
                <div key={item.id} className="bg-white p-4 border border-blue-200 rounded-lg shadow-sm">
                  <h4 className="font-bold text-blue-700 text-base mb-2">{item.title}</h4>
                  
                  {item.type === 'text' && (
                    <>
                      <div className="text-sm text-gray-800 space-y-3 whitespace-pre-wrap">{item.content}</div>
                      {item.description && <p className="text-xs text-gray-500 mt-2">{item.description}</p>}
                    </>
                  )}

                  {item.type === 'pdf' && (
                    <>
                      {item.description && <div className="text-sm text-gray-800 space-y-3 whitespace-pre-wrap">{item.description}</div>}
                      <a
                        href={item.content as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center text-sm text-blue-600 hover:underline font-medium"
                      >
                        <PaperClipIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        Ver/Descargar PDF Adjunto
                      </a>
                    </>
                  )}

                  {item.type === 'image' && (
                    <>
                      <div className="mt-2">
                        <img src={item.content as string} alt={item.title} className="rounded-md max-w-full h-auto max-h-48 object-contain border" />
                         <a
                            href={item.content as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-xs text-blue-600 hover:underline flex items-center"
                        >
                            <PhotographIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                            Ver imagen completa
                        </a>
                      </div>
                      {item.description && <p className="text-xs text-gray-500 mt-2">{item.description}</p>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        botResponseContent = "No encontré información sobre tu consulta. Puedes ayudarnos enviando un email a: 'nodefinido' y agregaremos la informanción para futuras consultas.";
      }
    }

    const newBotMessage: ChatMessage = {
      id: uuidv4(),
      type: 'bot',
      content: botResponseContent,
      timestamp: new Date(),
    };
    
    setTimeout(() => {
        setChatHistory(prev => [...prev, newBotMessage]);
    }, 500);
  };
  
  const renderMessageContent = (message: ChatMessage) => {
    if (typeof message.content === 'string') {
      return <p>{message.content}</p>;
    }
    return message.content; 
  };


  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-theme.spacing.20)] bg-white rounded-lg shadow-xl overflow-hidden">
      <header className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Info Avalon Assistant</h1>
      </header>

      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth">
        {chatHistory.map(message => (
          <div key={message.id} className={`flex items-end space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'bot' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                <HelpCircleIcon className="w-5 h-5" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-md lg:max-w-lg xl:max-w-2xl break-words
                ${message.type === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
            >
              {renderMessageContent(message)}
               <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
             {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">
                <AvatarUserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="pregunta..."
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white text-gray-900 placeholder-gray-400"
            aria-label="Chat input"
          />
          <button
            type="submit"
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            disabled={!inputValue.trim()}
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
         <p className="text-xs text-gray-500 mt-2 text-center">
            Utiliza 'ver todo' para ver la lista completa'.
        </p>
      </div>
    </div>
  );
};

export default InfoAvalonPage;