"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAppStore } from "@/store/useAppStore";
import { average } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ChatMessage, SugarReading } from "@/types";

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function AIChatWidget(): React.ReactElement {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  const chatMessages = useAppStore((state) => state.chatMessages);
  const addMessage = useAppStore((state) => state.addMessage);
  const clearMessages = useAppStore((state) => state.clearMessages);
  const readings = useAppStore((state) => state.readings);
  const addReading = useAppStore((state) => state.addReading);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const baseTextRef = useRef<string>("");

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isSending, isOpen]);

  // Focus input when opened with unmount cleanup
  useEffect(() => {
    if (!isOpen) return;
    const timerId = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timerId);
  }, [isOpen]);

  // Listen for global event to open chat widget with optional pre-filled query
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.query) {
        setInputMessage(customEvent.detail.query);
      }
    };

    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const toggleListening = () => {
    const win =
      typeof window !== "undefined"
        ? (window as unknown as {
            SpeechRecognition?: new () => ISpeechRecognition;
            webkitSpeechRecognition?: new () => ISpeechRecognition;
          })
        : null;

    const SpeechRecognitionClass =
      win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast.error(
        "Voice input is not supported by your browser. Please try Chrome, Edge, or Safari."
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      baseTextRef.current = inputMessage.trim();

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        const combined = (finalTranscript + interimTranscript).trim();
        const base = baseTextRef.current;
        setInputMessage(base ? `${base} ${combined}` : combined);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          toast.error(
            "Microphone access was denied. Please allow microphone permissions."
          );
        } else if (event.error !== "no-speech") {
          toast.error(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      toast.info("Listening... Speak now");
    } catch (err) {
      console.warn("Failed to start voice recognition:", err);
      toast.error("Could not start voice recognition. Please try again.");
      setIsListening(false);
    }
  };

  const handleSendMessage = async (
    e?: React.FormEvent,
    overrideText?: string
  ): Promise<void> => {
    if (e) e.preventDefault();
    const text = (overrideText ?? inputMessage).trim();
    if (!text || isSending) return;

    setErrorBanner(null);
    setLastFailedText(null);
    if (!overrideText) {
      setInputMessage("");
    }

    if (!overrideText) {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);
    }

    // Compute patient context from store readings
    const lastReading = readings.length > 0 ? readings[0].sugar_mg_dl : null;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = readings.filter(
      (r) => new Date(r.reading_date) >= sevenDaysAgo
    );
    const average7day =
      recent.length > 0
        ? Math.round(average(recent.map((r) => r.sugar_mg_dl)))
        : null;

    setIsSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: {
            lastReading,
            average7day,
          },
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errObj = data as { message?: string };
        throw new Error(errObj.message || "Failed to reach AI assistant");
      }

      const resObj = data as { reply: string; newReading?: SugarReading };
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: resObj.reply,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);

      // If a reading was automatically recorded by the assistant (via typing or voice)
      if (resObj.newReading) {
        addReading(resObj.newReading);
        const tagDisplay = resObj.newReading.meal_tag
          ? resObj.newReading.meal_tag.replace("_", " ")
          : "reading";
        toast.success(
          `Logged ${resObj.newReading.sugar_mg_dl} mg/dL (${tagDisplay}) automatically!`
        );
        router.refresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error contacting assistant";
      setErrorBanner(msg);
      setLastFailedText(text);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {/* Collapsed Floating Trigger */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          aria-label="Open AI Glycemic Assistant"
          className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground relative transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500" />
          </span>
        </Button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <Card className="w-[calc(100vw-2rem)] sm:w-96 shadow-2xl border-border flex flex-col h-[520px] max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <CardHeader className="bg-primary text-primary-foreground p-3.5 flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20 text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1">
                    Gluvia Assistant
                    <Sparkles className="h-3 w-3 text-yellow-300" />
                  </CardTitle>
                  <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-full bg-white/20 text-white border border-white/25 shadow-2xs backdrop-blur-xs tracking-tight">
                    powered by Aimmyy AI
                  </span>
                </div>
                <p className="text-[10px] text-primary-foreground/80 mt-0.5">
                  South Asian Diabetes Companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {chatMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={clearMessages}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs bg-muted/20">
            {/* Safety Notice Note */}
            <div className="rounded-md bg-muted/60 p-2 text-[11px] text-muted-foreground leading-tight text-center">
              Informational lifestyle guidance only. In case of emergency or
              severe symptoms, please consult your doctor immediately.
            </div>

            {/* Empty state welcome message */}
            {chatMessages.length === 0 && (
              <div className="rounded-lg border bg-card p-3 shadow-xs space-y-1.5 text-card-foreground">
                <div className="font-semibold text-xs text-primary flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5" />
                  Salam & Welcome!
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  I can help you understand how South Asian foods (roti, daal,
                  rice, chai) influence blood sugar and share lifestyle tips.
                  What is on your mind today?
                </p>
              </div>
            )}

            {/* Message history */}
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-xl px-3 py-2 max-w-[80%] leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                        : "bg-card text-card-foreground border shadow-xs rounded-tl-none whitespace-pre-wrap"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isUser && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* In-Chat Animated Typing Indicator */}
            {isSending && (
              <div
                className="flex items-center gap-2 text-muted-foreground pt-1"
                role="status"
                aria-live="polite"
                aria-label="Gluvia Assistant is typing"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-xl border bg-card text-card-foreground px-3.5 py-2 text-xs shadow-xs rounded-tl-none flex items-center gap-1.5">
                  <span className="sr-only">Gluvia is thinking...</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            )}

            {errorBanner && (
              <Alert variant="destructive" className="py-2 text-xs flex items-center justify-between">
                <AlertDescription className="flex-1">{errorBanner}</AlertDescription>
                {lastFailedText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs underline hover:bg-destructive/20 ml-2 shrink-0"
                    onClick={() => handleSendMessage(undefined, lastFailedText)}
                  >
                    Retry
                  </Button>
                )}
              </Alert>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* In-listening recording banner */}
          {isListening && (
            <div className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-[11px] text-rose-600 dark:text-rose-400 animate-in fade-in duration-150 shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span>Listening... Speak now</span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="font-semibold underline hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              if (isListening && recognitionRef.current) {
                recognitionRef.current.stop();
                setIsListening(false);
              }
              handleSendMessage(e);
            }}
            className="p-2.5 border-t bg-card flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening... speak now"
                    : "Ask about South Asian foods, sugar..."
                }
                disabled={isSending}
                className="h-9 text-xs focus-visible:ring-1 pr-9"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-3.5 w-3.5" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!inputMessage.trim() || isSending}
              aria-label="Send message"
              className="h-9 w-9 shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
