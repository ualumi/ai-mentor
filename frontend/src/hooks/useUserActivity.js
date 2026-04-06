/*import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PROGRESS_SERVICE = "http://localhost:8009"; // твой progress_service

export function useUserActivity(token, days = 30) {
  return useQuery(['userActivity', token, days], async () => {
    const res = await axios.get(`${PROGRESS_SERVICE}/attempts/activity`, {
      params: { token, days },
    });
    return res.data; // [{date: '2026-03-01', count: 3}, ...]
  });
}*/

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PROGRESS_SERVICE = "http://87.228.63.243:8009"; // твой progress_service

export function useUserActivity(token, days = 30) {
  return useQuery({
    queryKey: ['userActivity', token, days],
    queryFn: async () => {
      const res = await axios.get(`${PROGRESS_SERVICE}/attempts/activity`, {
        params: { token, days },
      });
      return res.data; // [{date: '2026-03-01', count: 3}, ...]
    },
  });
}