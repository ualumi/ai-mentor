
/*import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import { Loader, Sparkles  } from 'lucide-react';
import "../App.css"

export default function SubmitCodeButton({ 
  className = '',
  children = 'Подсказка ментора',
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
      className={`item submitcodebutton ${className}`}
      onClick={handleSubmit}
      disabled={executeMutation.isPending}
    >
      {executeMutation.isPending ? (
        <>
          <Loader size={18} className="spin" />
          <span></span>
        </>
      ) : (
        <>
          <Sparkles strokeWidth={1}/>
        </>
      )}
    </button>
  );
}*/

import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import { Loader, Sparkles  } from 'lucide-react';
import "../App.css"

export default function SubmitCodeButton({ 
  className = '',
  children = 'Подсказка ментора',
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
        type: "code_event",
        event: "submit_code",
        code
      });
    } catch (error) {
      console.error('Execution failed:', error);
      alert('Ошибка выполнения: ' + error.message);
    }
  };

  return (
    <div className="tooltip-wrapper">
      <button
        className={`item submitcodebutton ${className}`}
        onClick={handleSubmit}
        disabled={executeMutation.isPending}
      >
        {executeMutation.isPending ? (
          <>
            <Loader size={18} className="spin" />
          </>
        ) : (
          <Sparkles strokeWidth={1}/>
        )}
      </button>

      <span className="tooltip-text">{children}</span>
    </div>
  );
}