'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Settings, MessageSquare, Activity, Zap, Calendar, Music, Mail } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'jarvis'
  timestamp: Date
  emotion?: 'cheerful' | 'calm' | 'serious'
}

export default function JarvisAI() {
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Jarvis, your emotional AI companion. How can I assist you today?',
      sender: 'jarvis',
      timestamp: new Date(),
      emotion: 'cheerful'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(40).fill(0.2))
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('')

        if (event.results[0].isFinal) {
          handleUserMessage(transcript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isListening || isThinking) {
        setWaveformBars(prev => prev.map(() => Math.random() * 0.8 + 0.2))
      } else {
        setWaveformBars(prev => prev.map(() => 0.2))
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isListening, isThinking])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsThinking(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages })
      })

      const data = await response.json()

      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'jarvis',
        timestamp: new Date(),
        emotion: data.emotion || 'calm'
      }

      setMessages(prev => [...prev, jarvisMessage])

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response)
        utterance.rate = 0.9
        utterance.pitch = 1.1
        utterance.volume = 1
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'jarvis',
        timestamp: new Date(),
        emotion: 'serious'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUserMessage(inputText)
  }

  return (
    <div className="min-h-screen bg-jarvis-dark flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-jarvis-blue opacity-10 rounded-full blur-3xl top-1/4 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-jarvis-purple opacity-10 rounded-full blur-3xl bottom-1/4 right-1/4 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-8 z-10"
      >
        <h1 className="text-4xl font-bold glow text-jarvis-blue">JARVIS</h1>
        <p className="text-sm text-gray-400 mt-1">Emotional AI Companion</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 right-8 flex gap-3 z-10"
      >
        <button className="p-3 bg-jarvis-dark border border-jarvis-blue/30 rounded-lg hover:bg-jarvis-blue/10 transition-all">
          <Mail className="w-5 h-5 text-jarvis-blue" />
        </button>
        <button className="p-3 bg-jarvis-dark border border-jarvis-blue/30 rounded-lg hover:bg-jarvis-blue/10 transition-all">
          <Calendar className="w-5 h-5 text-jarvis-blue" />
        </button>
        <button className="p-3 bg-jarvis-dark border border-jarvis-blue/30 rounded-lg hover:bg-jarvis-blue/10 transition-all">
          <Music className="w-5 h-5 text-jarvis-blue" />
        </button>
        <button className="p-3 bg-jarvis-dark border border-jarvis-blue/30 rounded-lg hover:bg-jarvis-blue/10 transition-all">
          <Settings className="w-5 h-5 text-jarvis-blue" />
        </button>
      </motion.div>

      {/* Main container */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

        {/* HUD Visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 flex flex-col items-center justify-center p-8"
        >
          {/* Circular HUD */}
          <div className="relative w-80 h-80">
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-jarvis-blue/30"
            />

            {/* Middle ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border-2 border-jarvis-purple/30"
            />

            {/* Core circle */}
            <div className={`absolute inset-16 rounded-full bg-gradient-radial from-jarvis-blue/20 to-transparent flex items-center justify-center ${isListening ? 'pulse-ring' : ''}`}>
              <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-jarvis-blue/30 flex items-center justify-center"
              >
                <Activity className={`w-16 h-16 ${isListening ? 'text-jarvis-blue' : 'text-gray-500'}`} />
              </motion.div>
            </div>

            {/* Status indicators */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className={`px-4 py-2 rounded-full ${isListening ? 'bg-green-500/20 text-green-400' : isThinking ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'} text-xs font-semibold`}>
                {isListening ? 'LISTENING' : isThinking ? 'THINKING' : 'STANDBY'}
              </div>
            </div>
          </div>

          {/* Waveform */}
          <div className="mt-8 flex items-center justify-center gap-1 h-20">
            {waveformBars.map((height, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-gradient-to-t from-jarvis-blue to-jarvis-purple rounded-full"
                animate={{ height: `${height * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Microphone button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`mt-8 p-6 rounded-full ${isListening ? 'bg-jarvis-blue' : 'bg-jarvis-dark border-2 border-jarvis-blue'} transition-all shadow-lg`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-jarvis-dark" />
            ) : (
              <Mic className="w-8 h-8 text-jarvis-blue" />
            )}
          </motion.button>
          <p className="mt-4 text-sm text-gray-400">
            {isListening ? 'Click to stop' : 'Click to speak or say "Hey Jarvis"'}
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 flex flex-col h-[600px] gradient-border rounded-2xl overflow-hidden"
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-jarvis-dark/50 backdrop-blur-xl">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'bg-jarvis-blue/20' : 'bg-jarvis-purple/20'} rounded-2xl p-4 backdrop-blur-sm`}>
                    <div className="flex items-start gap-3">
                      {message.sender === 'jarvis' && (
                        <div className="w-8 h-8 rounded-full bg-jarvis-blue/30 flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-jarvis-blue" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-white leading-relaxed">{message.text}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                          {message.emotion && ` • ${message.emotion}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-jarvis-purple/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-jarvis-dark/80 backdrop-blur-xl border-t border-jarvis-blue/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message or use voice..."
                className="flex-1 bg-jarvis-dark/50 border border-jarvis-blue/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-jarvis-blue transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-jarvis-blue rounded-xl text-jarvis-dark font-semibold hover:bg-jarvis-blue/80 transition-all"
              >
                Send
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* System stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-8 flex gap-6 text-xs text-gray-500 z-10"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>System Online</span>
        </div>
        <div>Memory: {messages.length} messages</div>
        <div>Mode: {isListening ? 'Voice Active' : 'Standby'}</div>
      </motion.div>
    </div>
  )
}
