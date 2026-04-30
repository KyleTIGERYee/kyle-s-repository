import { AI_CONFIG } from '../ai_config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Dify API Service
 * Endpoint: POST /chat-messages
 * Documentation: https://docs.dify.ai/api-reference/chat-app/chat-messages
 */
export const streamChatCompletion = async (
  query: string,
  conversationId: string | null,
  onChunk: (chunk: string) => void,
  onDone: (newConversationId: string) => void,
  onError: (error: Error) => void,
  onAbort: (() => void) | null,
  userId: string = 'user-123',
  abortSignal?: AbortSignal
) => {
  try {
    const response = await fetch(`${AI_CONFIG.apiConfig.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiConfig.apiKey}`,
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        response_mode: 'streaming',
        conversation_id: conversationId || '',
        user: userId,
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentConversationId = conversationId || '';

    while (true) {
      if (abortSignal?.aborted) {
        reader.cancel();
        onAbort?.();
        return;
      }

      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;

        try {
          const jsonStr = line.replace('data: ', '');
          const data = JSON.parse(jsonStr);

          if (data.event === 'message' || data.event === 'agent_message') {
            const answer = data.answer;
            if (answer) {
              onChunk(answer);
            }
            if (data.conversation_id && !currentConversationId) {
              currentConversationId = data.conversation_id;
            }
          } else if (data.event === 'workflow_finished' || data.event === 'message_end') {
            if (data.conversation_id && !currentConversationId) {
              currentConversationId = data.conversation_id;
            }
          } else if (data.event === 'error') {
            throw new Error(data.message || 'Unknown stream error');
          }

        } catch (e) {
          console.warn('Error parsing SSE line:', line, e);
        }
      }
    }

    onDone(currentConversationId);

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      onAbort?.();
      return;
    }
    console.error('Dify API Request Failed:', error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * 流式 AI 响应 - 用于 AIChat 组件
 */
export const streamAIResponse = async (
  query: string,
  onChunk: (chunk: string) => void,
  abortSignal?: AbortSignal
): Promise<void> => {
  return new Promise((resolve, reject) => {
    streamChatCompletion(
      query,
      null,
      onChunk,
      () => resolve(),
      (error) => reject(error),
      null,
      'user-123',
      abortSignal
    );
  });
};

/**
 * 非流式 AI 响应
 */
export const generateAIResponse = async (query: string): Promise<string> => {
  let fullResponse = '';
  
  return new Promise((resolve, reject) => {
    streamChatCompletion(
      query,
      null,
      (chunk) => { fullResponse += chunk; },
      () => resolve(fullResponse),
      (error) => reject(error),
      null,
      'user-123'
    );
  });
};

/**
 * 图表分析功能
 */
export const analyzeChart = async (chartData: any, question: string): Promise<string> => {
  const query = `请分析以下图表数据并回答问题：\n\n图表数据：${JSON.stringify(chartData, null, 2)}\n\n问题：${question}`;
  return generateAIResponse(query);
};
