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
} from "lucide-react";

import { useAppStore } from "@/store/useAppStore";
import { average } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ChatMessage } from "@/types";

export function AIChatWidget(): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const chatMessages = useAppStore((state) => state.chatMessages);
  const addMessage = useAppStore((state) => state.addMessage);
  const clearMessages = useAppStore((state) => state.clearMessages);
  const readings = useAppStore((state) => state.readings);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    setErrorBanner(null);
    setInputMessage("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);

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

      const resObj = data as { reply: string };
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: resObj.reply,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error contacting assistant";
      setErrorBanner(msg);
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
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  Gluvia Assistant
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                </CardTitle>
                <p className="text-[10px] text-primary-foreground/80">
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

            {/* Typing indicator */}
            {isSending && (
              <div className="flex items-center gap-2 text-muted-foreground pt-1">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-xl border bg-card px-3 py-2 text-xs flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>Gluvia is thinking...</span>
                </div>
              </div>
            )}

            {errorBanner && (
              <Alert variant="destructive" className="py-2 text-xs">
                <AlertDescription>{errorBanner}</AlertDescription>
              </Alert>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 border-t bg-card flex items-center gap-2 shrink-0"
          >
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about South Asian foods, sugar..."
              disabled={isSending}
              className="h-9 text-xs focus-visible:ring-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputMessage.trim() || isSending}
              aria-label="Send message"
              className="h-9 w-9 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
