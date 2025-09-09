import { UsernameRecord } from './constants';

// Search users with debouncing and abort controller support
export const searchUsers = async (
  prefix: string, 
  signal?: AbortSignal
): Promise<{ users: UsernameRecord[]; error?: string }> => {
  if (prefix.length < 2) {
    return { users: [], error: 'Minimum 2 characters required' };
  }

  try {
    const response = await fetch(
      `/api/resolve?prefix=${encodeURIComponent(prefix)}&limit=10`,
      { 
        signal,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        users: [], 
        error: errorData.error || `HTTP ${response.status}` 
      };
    }

    const data = await response.json();
    
    // Validate response structure
    if (!Array.isArray(data.users)) {
      return { users: [], error: 'Invalid response format' };
    }

    // Validate each user record
    const validUsers = data.users.filter((user: unknown) => {
      const u = user as Record<string, unknown>;
      return (
        typeof u.username === 'string' &&
        typeof u.ownerAddress === 'string' &&
        u.ownerAddress.startsWith('0x') &&
        u.ownerAddress.length === 42 &&
        typeof u.preferredDstEid === 'number' &&
        ['base', 'arbitrum'].includes(u.chainKey as string)
      );
    });

    return { users: validUsers };

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { users: [], error: 'Search cancelled' };
      }
      return { users: [], error: error.message };
    }
    return { users: [], error: 'Unknown error occurred' };
  }
};

// Debounced search hook
export const useDebouncedSearch = (delay: number = 300) => {
  let timeoutId: NodeJS.Timeout;
  let abortController: AbortController | null = null;

  const debouncedSearch = (
    query: string, 
    callback: (result: { users: UsernameRecord[]; error?: string }) => void
  ) => {
    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }

    // Clear previous timeout
    clearTimeout(timeoutId);

    // Set new timeout
    timeoutId = setTimeout(async () => {
      abortController = new AbortController();
      const result = await searchUsers(query, abortController.signal);
      callback(result);
    }, delay);
  };

  const cleanup = () => {
    clearTimeout(timeoutId);
    if (abortController) {
      abortController.abort();
    }
  };

  return { debouncedSearch, cleanup };
}; 