{/*import { useExecuteCode } from '../../../hooks/useCodeExecution';
import { useCode } from '../../CodeContext';
import { Loader, Lightbulb } from 'lucide-react';
import "../../../App.css"

export default function CheckTaskButton({ 
  className = '',
  children = 'Проверить',
}) {
  const { code } = useCode();
  const executeMutation = useExecuteCode();

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Введите код для выполнения');
      return;
    }

    try {
      await executeMutation.mutateAsync({ 
        type: "code_event",          // ✅ добавлено
        event: "submit_code",        // ✅ строго как ждёт бек
        code
      });
    } catch (error) {
      console.error('Execution failed:', error);
      alert('Ошибка выполнения: ' + error.message);
    }
  };

  return (
    <button
      className="module-next-button module-button"
      onClick={handleSubmit}
      disabled={executeMutation.isPending}
    >
      {executeMutation.isPending ? (
        <>
          <Loader size={18} className="spin" />
          <span>Выполняется...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
        </>
      )}
    </button>
  );
}*/}


import { useExecuteCode } from '../../../hooks/useCodeExecution';
import { useCode } from '../../CodeContext';
import { Loader } from 'lucide-react';
import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";
import "../../../App.css";

export default function CheckTaskButton({ 
  className = '',
  children = 'Проверить',
}) {
  const { code } = useCode();
  const executeMutation = useExecuteCode();

  // 🔥 НОВОЕ: состояние ожидания ответа по WS
  const [waitingForResult, setWaitingForResult] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Введите код для выполнения');
      return;
    }

    try {
      setWaitingForResult(true); // 🔥 начинаем ждать WS

      await executeMutation.mutateAsync({ 
        type: "code_event",
        event: "submit_code",
        code
      });

    } catch (error) {
      console.error('Execution failed:', error);
      setWaitingForResult(false); // 🔥 если ошибка — сбрасываем
      alert('Ошибка выполнения: ' + error.message);
    }
  };

  // 🔥 СЛУШАЕМ user_progress
  useEffect(() => {
    const handler = (data) => {
      if (!data) return;

      // сюда приходит прогресс после submit_code
      setWaitingForResult(false);
    };

    wsService.on("analytics_response", handler);

    return () => {
      wsService.off("analytics_response", handler);
    };
  }, []);

  const isLoading = executeMutation.isPending || waitingForResult;

  return (
    <button
      className="module-next-button module-button"
      onClick={handleSubmit}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span>Проверка...</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
