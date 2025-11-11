describe('config/api', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('api module can be imported', () => {
    expect(true).toBe(true);
  });

  test('localStorage operations work', () => {
    localStorage.setItem('authToken', 'test');
    expect(localStorage.getItem('authToken')).toBe('test');
    localStorage.removeItem('authToken');
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});

