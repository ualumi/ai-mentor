// hooks/useCodeExecution.js
/*import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { wsService } from '../services/websocket';
import { useState, useEffect } from 'react';

// Уникальные ключи для кэширования
const QUERY_KEYS = {
  executionResult: (taskId) => ['executionResult', taskId],
};

// Хук для выполнения кода
export const useExecuteCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, event = 'run_code' }) => {
      // Отправляем код на сервер
      await wsService.send(event, { code });
      
      // Возвращаем промис, который разрешится когда придет результат
      return new Promise((resolve) => {
        const handler = (data) => {
          wsService.off('execution_result', handler);
          resolve(data);
        };
        wsService.on('execution_result', handler);
      });
    },
    
    onSuccess: (data, variables) => {
      // Сохраняем результат в кэш
      queryClient.setQueryData(
        QUERY_KEYS.executionResult('current'), 
        data
      );
    },
  });
};

// Хук для получения последнего результата
export const useExecutionResult = () => {
  return useQuery({
    queryKey: QUERY_KEYS.executionResult('current'),
    // Данные уже есть в кэше, запрос не нужен
    enabled: false, 
  });
};

// Хук для подписки на WebSocket события (долгоживущие)
export const useWebSocketSubscription = (eventType, handler) => {
  useEffect(() => {
    wsService.on(eventType, handler);
    
    return () => {
      wsService.off(eventType, handler);
    };
  }, [eventType, handler]);
};*/

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { wsService } from '../services/websocket';
import { useState } from 'react';

const QUERY_KEYS = {
  executionResult: (taskId) => ['executionResult', taskId],
};

export const useExecuteCode = () => {
  const queryClient = useQueryClient();
  const [isWaiting, setIsWaiting] = useState(false);

  return useMutation({
    mutationFn: async ({ type = "code_event", event = 'run_code', code }) => {
      setIsWaiting(true);

      return new Promise(async (resolve, reject) => {
        // ✅ Подписываемся на события до отправки
        const wildcardHandler = (data) => {
          console.log('📨 Received message:', data);

          if (data.source?.startsWith("sandbox_response")) {
            cleanup();
            resolve(data);
          }

          else if (data.event === 'mentor_reply' || data.type === 'mentor_reply') {
            cleanup();
            resolve(data);
          }

          else if (data.event === 'execution_result' || data.type === 'execution_result') {
            cleanup();
            resolve(data);
          }
          console.log(
            "Total wildcard handlers:",
            wsService.messageHandlers.get('*')?.length
          );
        };

        

        const cleanup = () => {
          clearTimeout(timeout);
          wsService.off('*', wildcardHandler);
          setIsWaiting(false);
        };

        wsService.on('*', wildcardHandler);

        // Таймаут на случай если сервер не отвечает
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Timeout: сервер не отвечает'));
        }, 10000);

        try {
          // ✅ Отправляем код после подписки
          await wsService.send({
            type,
            event,
            code
          });

          // Для submit_code — фейковый mentor_reply отправится автоматически в WS
        } catch (error) {
          cleanup();
          reject(error);
        }
      });
    },

    onSuccess: (data) => {
      console.log('💾 Saving result to cache:', data);
      queryClient.setQueryData(
        QUERY_KEYS.executionResult('current'), 
        data
      );
    },

    onError: (error) => {
      console.error('❌ Execution failed:', error);
    },
  });
};

// hooks/useCodeExecution.js
/*import { useQueryClient, useMutation } from '@tanstack/react-query';
import { wsService } from '../services/websocket';
import { useState } from 'react';

const QUERY_KEYS = {
  executionResult: (taskId) => ['executionResult', taskId],
};

export const useExecuteCode = () => {
  const queryClient = useQueryClient();
  const [isWaiting, setIsWaiting] = useState(false);

  return useMutation({
    mutationFn: async ({ code, event = 'run_code' }) => {
      setIsWaiting(true);
      
      try {
        // Отправляем код
        await wsService.send(event, { code });
        
        // Ждем ответ
        return new Promise((resolve, reject) => {
          // Таймаут на случай если сервер не отвечает
          const timeout = setTimeout(() => {
            wsService.off('*', wildcardHandler);
            setIsWaiting(false);
            reject(new Error('Timeout: сервер не отвечает'));
          }, 10000);

          // Универсальный обработчик для всех сообщений
          const wildcardHandler = (data) => {
            console.log('📨 Received message in wildcard handler:', data);
            
            // Проверяем разные возможные форматы ответа
            if (data.event === 'mentor_reply' || data.type === 'mentor_reply') {
              console.log('✅ Found mentor_reply, resolving with data:', data);
              clearTimeout(timeout);
              wsService.off('*', wildcardHandler);
              setIsWaiting(false);
              resolve(data);
            }
            // Если это результат выполнения
            else if (data.result !== undefined || data.output !== undefined) {
              console.log('✅ Found execution result, resolving with data:', data);
              clearTimeout(timeout);
              wsService.off('*', wildcardHandler);
              setIsWaiting(false);
              resolve(data);
            }
            // Если это execution_result
            else if (data.event === 'execution_result' || data.type === 'execution_result') {
              console.log('✅ Found execution_result, resolving with data:', data);
              clearTimeout(timeout);
              wsService.off('*', wildcardHandler);
              setIsWaiting(false);
              resolve(data);
            }
          };

          // Подписываемся на все сообщения
          wsService.on('*', wildcardHandler);
          
          console.log('👂 Waiting for server response...');
        });
      } catch (error) {
        setIsWaiting(false);
        throw error;
      }
    },
    
    onSuccess: (data) => {
      console.log('💾 Saving result to cache:', data);
      queryClient.setQueryData(
        QUERY_KEYS.executionResult('current'), 
        data
      );
    },
    
    onError: (error) => {
      console.error('❌ Execution failed:', error);
    },
  });
};*/