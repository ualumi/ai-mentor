/*import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import { Loader, Play } from 'lucide-react';
import "../App.css"

export function RunCodeButton({ 
  className = '',
  children = 'Запустить код',
}) {
  const { code } = useCode();
  const executeMutation = useExecuteCode();

  const handleRun = async () => {
    console.log("CODE VALUE:", code);
    if (!code.trim()) {
      alert('Введите код для выполнения');
      return;
    }

    try {
      await executeMutation.mutateAsync({ 
        type: "code_event",        // ✅ обязательно
        event: "run_code",         // ✅ другое событие
        code
      });
    } catch (error) {
      console.error('Run failed:', error);
      alert('Ошибка выполнения: ' + error.message);
    }
  };

  return (
    <button
      className={`item item-primary ${className}`}
      onClick={handleRun}
      disabled={executeMutation.isPending}
    >
      {executeMutation.isPending ? (
        <>
          <Loader size={18} className="spin" />

        </>
      ) : (
        <>
          <Play strokeWidth={1} />
        </>
      )}
    </button>
  );
}*/

import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import { Loader, Play } from 'lucide-react';
import "../App.css"

export function RunCodeButton({ 
  className = '',
  children = 'Запустить код',
}) {
  const { code } = useCode();
  const executeMutation = useExecuteCode();

  const handleRun = async () => {
    console.log("CODE VALUE:", code);
    if (!code.trim()) {
      alert('Введите код для выполнения');
      return;
    }

    try {
      await executeMutation.mutateAsync({ 
        type: "code_event",
        event: "run_code",
        code
      });
    } catch (error) {
      console.error('Run failed:', error);
      alert('Ошибка выполнения: ' + error.message);
    }
  };

  return (
    <div className="tooltip-wrapper">
      <button
        className={`item item-primary item-run-button ${className}`}
        onClick={handleRun}
        disabled={executeMutation.isPending}
      >
        {executeMutation.isPending ? (
          <Loader size={18} className="spin" />
        ) : (
          <Play strokeWidth={1} />
        )}
      </button>

      <span className="tooltip-text">{children}</span>
    </div>
  );
}
