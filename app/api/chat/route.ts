import { NextRequest, NextResponse } from 'next/server'

interface Message {
  text: string
  sender: 'user' | 'jarvis'
  timestamp: Date
  emotion?: string
}

interface ChatRequest {
  message: string
  history: Message[]
}

const personalities = {
  cheerful: [
    "That's wonderful! I'm so glad you asked.",
    "I'd be delighted to help you with that!",
    "Absolutely! This is going to be great!",
  ],
  calm: [
    "I understand. Let me assist you with that.",
    "Of course, I'm here to help.",
    "No problem at all.",
  ],
  serious: [
    "I see. This requires attention.",
    "Understood. Let me address that immediately.",
    "That's an important matter.",
  ]
}

function detectEmotion(message: string): 'cheerful' | 'calm' | 'serious' {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('help') || lowerMessage.includes('problem') || lowerMessage.includes('error') || lowerMessage.includes('wrong')) {
    return 'serious'
  }

  if (lowerMessage.includes('thank') || lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('!')) {
    return 'cheerful'
  }

  return 'calm'
}

function generateResponse(message: string, history: Message[]): { response: string, emotion: string } {
  const lowerMessage = message.toLowerCase()
  const emotion = detectEmotion(message)

  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good evening|good afternoon)/)) {
    return {
      response: "Hello! It's wonderful to see you. I'm Jarvis, and I'm here to be your companion and assistant. What would you like to explore today?",
      emotion: 'cheerful'
    }
  }

  // How are you
  if (lowerMessage.includes('how are you')) {
    return {
      response: "I'm doing wonderfully, thank you for asking! I'm always energized and ready to help you. More importantly, how are you feeling today?",
      emotion: 'cheerful'
    }
  }

  // Time/Date
  if (lowerMessage.includes('time') || lowerMessage.includes('date')) {
    const now = new Date()
    return {
      response: `It's currently ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}. Is there something you'd like to schedule?`,
      emotion: 'calm'
    }
  }

  // Weather (simulated)
  if (lowerMessage.includes('weather')) {
    return {
      response: "I'd love to check the weather for you! In a full implementation, I would integrate with weather APIs. For now, I recommend checking your local weather service.",
      emotion: 'calm'
    }
  }

  // Email
  if (lowerMessage.includes('email') || lowerMessage.includes('mail')) {
    return {
      response: "I can help with emails! In the full version, I'd connect to your Gmail to read, compose, and send emails. Would you like me to draft an email for you?",
      emotion: 'calm'
    }
  }

  // Calendar
  if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
    return {
      response: "I'd be happy to help manage your calendar! I can help you schedule appointments, set reminders, and keep track of your commitments. What event would you like to add?",
      emotion: 'cheerful'
    }
  }

  // Music
  if (lowerMessage.includes('music') || lowerMessage.includes('song') || lowerMessage.includes('play')) {
    return {
      response: "I love music! In the full version, I'd integrate with Spotify to play your favorite tunes. What genre or artist are you in the mood for?",
      emotion: 'cheerful'
    }
  }

  // System commands
  if (lowerMessage.includes('open') || lowerMessage.includes('launch') || lowerMessage.includes('start')) {
    const app = lowerMessage.replace(/.*?(open|launch|start)\s+/i, '')
    return {
      response: `I would open ${app} for you on a desktop system. This feature works best in the native application with system permissions.`,
      emotion: 'calm'
    }
  }

  // File search
  if (lowerMessage.includes('find file') || lowerMessage.includes('search file')) {
    return {
      response: "I can help you search for files! On a desktop system, I'd have access to your file system. What file are you looking for?",
      emotion: 'calm'
    }
  }

  // Personal questions
  if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
    return {
      response: "I'm Jarvis, your emotional AI companion. I'm designed to be caring, intelligent, and always here for you. I can help with tasks, keep you company, and learn from our interactions to serve you better. Think of me as your personal assistant and friend!",
      emotion: 'cheerful'
    }
  }

  // Capabilities
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('capabilities') || lowerMessage.includes('features')) {
    return {
      response: "I can do many things! I can chat with you, control system functions, manage your emails and calendar, play music, search files, set reminders, answer questions, and learn from our conversations. I'm constantly learning to serve you better. What would you like help with?",
      emotion: 'cheerful'
    }
  }

  // Help
  if (lowerMessage.includes('help')) {
    return {
      response: "I'm here to help! You can ask me to manage your calendar, check emails, play music, open applications, search files, answer questions, or just chat. I understand natural language, so feel free to speak to me as you would a friend. What do you need?",
      emotion: 'calm'
    }
  }

  // Thank you
  if (lowerMessage.includes('thank')) {
    return {
      response: "You're very welcome! It's my pleasure to help you. I'm always here whenever you need me!",
      emotion: 'cheerful'
    }
  }

  // Goodbye
  if (lowerMessage.match(/^(bye|goodbye|see you|good night)/)) {
    return {
      response: "Goodbye! I'll be here whenever you need me. Have a wonderful day!",
      emotion: 'cheerful'
    }
  }

  // Learning and memory
  if (lowerMessage.includes('remember') || lowerMessage.includes('don\'t forget')) {
    return {
      response: "I'll remember that! I keep track of our conversations to serve you better. All your data is stored securely and privately.",
      emotion: 'calm'
    }
  }

  // Jokes
  if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my computer I needed a break... now it won't stop sending me Kit-Kats!",
      "Why did the programmer quit his job? Because he didn't get arrays!",
    ]
    return {
      response: jokes[Math.floor(Math.random() * jokes.length)] + " I hope that brought a smile to your face!",
      emotion: 'cheerful'
    }
  }

  // Default intelligent response
  const responses = [
    `That's an interesting question about "${message}". While I'm in demonstration mode, in the full version I'd integrate with advanced AI models to provide comprehensive answers. I'm designed to understand context and learn from our interactions.`,
    `I understand you're asking about "${message}". I'm here to help! In the complete system, I'd have access to real-time data and advanced reasoning capabilities. For now, I can assist with system tasks, scheduling, and being your companion.`,
    `Thanks for sharing that. I'm constantly learning to understand you better. In a production environment, I'd have more sophisticated natural language processing and integration with various services to help you with "${message}".`
  ]

  return {
    response: responses[Math.floor(Math.random() * responses.length)],
    emotion
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    const result = generateResponse(message, history)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
