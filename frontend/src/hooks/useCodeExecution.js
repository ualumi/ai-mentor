

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
    mutationFn: async ({ type = "code_event", event = 'run_code', code }) => {
      setIsWaiting(true);

      return new Promise(async (resolve, reject) => {
        // ✅ Подписываемся на события до отправки
        const wildcardHandler = (data) => {
          console.log('📨 Received message:', data);

          //if (data.source?.startsWith("sandbox_response")) {
          //  cleanup();
          //  resolve(data);
          //}

          //else if (data.event === 'mentor_reply' || data.type === 'mentor_reply') {
          //  cleanup();
          //  resolve(data);
          //}

          //else if (data.event === 'execution_result' || data.type === 'execution_result') {
          //  cleanup();
          //  resolve(data);
          //}
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
};*/
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { wsService } from '../services/websocket';
export const useExecuteCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type = "code_event", event = "run_code", code }) => {
      await wsService.send({
        type,
        event,
        code,
      });
    }

  });
};

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
    mutationFn: async ({ type = "code_event", event = 'run_code', code }) => {
      setIsWaiting(true);

      return new Promise(async (resolve, reject) => {

        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Timeout: сервер не отвечает'));
        }, 10000);

        const cleanup = () => {
          clearTimeout(timeout);
          wsService.off('*', wildcardHandler);
          setIsWaiting(false);
        };

        const wildcardHandler = (data) => {
          console.log('📨 Received message:', data);

          // 🔥 фильтрация нужного ответа
          if (
            data.event === 'sandbox_response' ||
            data.type === 'execution_result' ||
            data.event === 'mentor_reply' ||
            data.type === 'mentor_reply'
          ) {
            cleanup();   // ⬅️ удаляем обработчик
            resolve(data);
          }
        };

        // ✅ Подписка ДО отправки
        wsService.on('sandbox_response', wildcardHandler);

        try {
          await wsService.send({
            type,
            event,
            code
          });
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
};*/
