import { renderHook, act, waitFor } from '@testing-library/react';
import useApi from '../../src/hooks/useApi.js';

const mockGet = jest.fn().mockResolvedValue({ data: { data: { ok: true } } });

jest.mock('../../src/config/api.js', () => ({
  __esModule: true,
  default: { get: (...args) => mockGet(...args) }
}));

describe('useApi Hook', () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockGet.mockResolvedValue({ data: { data: { ok: true } } });
  });

  test('fetches data on mount', async () => {
    const { result } = renderHook(() => useApi('/x'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
  expect(result.current.loading).toBe(false);
    });
  expect(result.current.data).toEqual({ ok: true });
    expect(mockGet).toHaveBeenCalled();
  });

  test('handles errors', async () => {
    const error = new Error('API Error');
    mockGet.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useApi('/error'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeNull();
  });

  test('supports refetch', async () => {
    const { result } = renderHook(() => useApi('/x'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    mockGet.mockResolvedValueOnce({ data: { data: { ok: false } } });
  await act(async () => {
    result.current.refetch();
  });
    await waitFor(() => {
  expect(result.current.data).toEqual({ ok: false });
    });
  });

  test('passes options to api.get', async () => {
    const options = { params: { id: 1 } };
    renderHook(() => useApi('/x', options));
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/x', options);
    });
  });
});

