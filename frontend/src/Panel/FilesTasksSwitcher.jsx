import { useState } from "react";
import ButtonNew from "./ButtonNew";
import '../App.css'

function FilesTasksSwitcher() {
  const [activeTab, setActiveTab] = useState("Files"); // "Files" или "Tasks"

  return (
    <div className="files-tasks-switcher">
      <div className="tab-buttons">
        <button
          className={`${activeTab === "Files" ? "active" : ""} buttonswitcher`}
          onClick={() => setActiveTab("Files")}
        >
          Files
        </button>
        <button
          className={`${activeTab === "Tasks" ? "active" : ""} buttonswitcher`}
          onClick={() => setActiveTab("Tasks")}
        >
          Tasks
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "Files" && (
          <div className="files-content">
            {/* Здесь будет контент для Files */
                <ButtonNew></ButtonNew>
            }
          </div>
        )}
        {activeTab === "Tasks" && (
          <div className="tasks-content">
            {/* Здесь будет контент для Tasks */
                <p>Задание будет здесь</p>
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default FilesTasksSwitcher;
