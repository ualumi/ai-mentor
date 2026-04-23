{/*import { useMutation } from "@tanstack/react-query";
import { startLearningSession } from "../../api/learningService";

export const useStartModule = () => {
  return useMutation({
    mutationFn: ({ competency, token }) =>
      startLearningSession(competency, token)
  });
};*/}

import { useMutation } from "@tanstack/react-query";
import { startLearningSession, getLearningState } from "../api/learningService";

export const useStartModule = () => {
  return useMutation({
    mutationFn: async ({ competency, token }) => {
      const startData = await startLearningSession(competency, token);

      // 🔥 если модуль уже существует → грузим state
      if (startData.isExisting) {
        const state = await getLearningState(startData.sessionId, token);

        return {
          sessionId: startData.sessionId,
          session: startData.session,
          state,
          isExisting: true
        };
      }
      const state = await getLearningState(startData.sessionId, token);
      // 🔥 если новый
      return {
        sessionId: startData.sessionId,
        session: startData.session,
        state,
        isExisting: true
      };
    }
  });
};