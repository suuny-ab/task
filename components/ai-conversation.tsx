"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { AIMessage, BuildStep, UserResponseType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Sparkles, 
  Send, 
  Check, 
  X, 
  Edit3,
  ChevronDown,
  Bot,
  User
} from "lucide-react"

interface AIConversationProps {
  currentStep: BuildStep | null
  messages: AIMessage[]
  onUserResponse: (response: UserResponseType, adjustedContent?: string) => void
  onSendMessage: (content: string) => void
  isProcessing?: boolean
}

export function AIConversation({
  currentStep,
  messages,
  onUserResponse,
  onSendMessage,
  isProcessing = false,
}: AIConversationProps) {
  const [inputValue, setInputValue] = useState("")
  const [showAdjustInput, setShowAdjustInput] = useState(false)
  const [adjustValue, setAdjustValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return
    onSendMessage(inputValue.trim())
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAccept = () => {
    onUserResponse("accept")
    setShowAdjustInput(false)
  }

  const handleReject = () => {
    onUserResponse("reject")
    setShowAdjustInput(false)
  }

  const handleAdjust = () => {
    if (showAdjustInput && adjustValue.trim()) {
      onUserResponse("adjust", adjustValue.trim())
      setAdjustValue("")
      setShowAdjustInput(false)
    } else {
      setShowAdjustInput(true)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground">AI 助手</h3>
          <p className="text-xs text-muted-foreground truncate">
            {currentStep ? `当前：${currentStep.title}` : "等待开始构建"}
          </p>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden" ref={scrollRef}>
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Waiting for user response indicator */}
            {currentStep?.status === "current" && !isProcessing && (
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ChevronDown className="w-4 h-4" />
                  <span>请选择您的决策</span>
                </div>
                
                {/* Response buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1.5"
                    onClick={handleAccept}
                  >
                    <Check className="w-4 h-4" />
                    确认
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleAdjust}
                  >
                    <Edit3 className="w-4 h-4" />
                    {showAdjustInput ? "提交调整" : "调整"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-muted-foreground hover:text-destructive"
                    onClick={handleReject}
                  >
                    <X className="w-4 h-4" />
                    拒绝
                  </Button>
                </div>

                {/* Adjust input */}
                {showAdjustInput && (
                  <div className="flex flex-col gap-2 mt-2">
                    <Textarea
                      placeholder="请输入您的调整意见..."
                      value={adjustValue}
                      onChange={(e) => setAdjustValue(e.target.value)}
                      className="min-h-[80px] bg-input text-foreground"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAdjustInput(false)}
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        disabled={!adjustValue.trim()}
                        onClick={handleAdjust}
                      >
                        提交调整
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            placeholder="输入消息与 AI 对话..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-[120px] bg-input text-foreground resize-none"
            disabled={isProcessing}
          />
          <Button 
            size="icon" 
            className="flex-shrink-0 h-[44px] w-[44px]"
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isAI = message.role === "ai"
  
  return (
    <div className={cn("flex gap-3", isAI ? "flex-row" : "flex-row-reverse")}>
      {/* Avatar */}
      <div 
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isAI ? "bg-primary/20" : "bg-accent"
        )}
      >
        {isAI ? (
          <Bot className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-accent-foreground" />
        )}
      </div>

      {/* Message content */}
      <div 
        className={cn(
          "flex-1 max-w-[85%] p-3 rounded-lg text-sm",
          isAI 
            ? "bg-muted text-foreground rounded-tl-none" 
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        {/* User response badge */}
        {message.userResponse && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <span 
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                message.userResponse === "accept" && "bg-success/20 text-success",
                message.userResponse === "adjust" && "bg-warning/20 text-warning",
                message.userResponse === "reject" && "bg-destructive/20 text-destructive"
              )}
            >
              {message.userResponse === "accept" ? "已确认" : message.userResponse === "adjust" ? "已调整" : "已拒绝"}
            </span>
          </div>
        )}

        {/* Adjusted content */}
        {message.adjustedContent && (
          <div className="mt-2 p-2 bg-background/50 rounded text-xs text-muted-foreground">
            <span className="text-warning">调整内容：</span> {message.adjustedContent}
          </div>
        )}

        {/* Timestamp */}
        <div className={cn(
          "text-xs mt-2",
          isAI ? "text-muted-foreground" : "text-primary-foreground/70"
        )}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  )
}
