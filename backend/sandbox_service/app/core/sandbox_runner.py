import subprocess
import tempfile
import os

async def run_code(code: str, timeout: int = 5) -> dict:
    """
    Запуск кода в изолированном временном файле через subprocess.
    Возвращает stdout, stderr и статус.
    """
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as tmp_file:
        tmp_file.write(code)
        tmp_file_path = tmp_file.name

    try:
        result = subprocess.run(
            ["python3", tmp_file_path],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Execution timed out", "returncode": -1}
    finally:
        os.remove(tmp_file_path)
