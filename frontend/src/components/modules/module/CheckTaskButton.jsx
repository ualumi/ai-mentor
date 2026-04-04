import { useExecuteCode } from '../../../hooks/useCodeExecution';
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
}