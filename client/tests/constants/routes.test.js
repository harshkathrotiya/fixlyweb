import { ROUTES } from '../../src/constants/routes.js';

describe('ROUTES Constants', () => {
  test('contains all expected route paths', () => {
  expect(ROUTES.HOME).toBe('/');
  expect(ROUTES.LOGIN).toBe('/login');
  expect(ROUTES.SIGNUP).toBe('/signup');
    expect(ROUTES.SERVICES).toBe('/services');
    expect(ROUTES.SERVICE_DETAILS).toBe('/listing/:id');
    expect(ROUTES.PROFILE).toBe('/profile');
    expect(ROUTES.BOOKINGS).toBe('/bookings');
    expect(ROUTES.BOOKING_DETAILS).toBe('/booking/:id');
  });

  test('contains provider routes', () => {
    expect(ROUTES.PROVIDER_DASHBOARD).toBe('/provider/dashboard');
    expect(ROUTES.PROVIDER_CREATE_LISTING).toBe('/provider/create-listing');
    expect(ROUTES.PROVIDER_EDIT_LISTING).toBe('/provider/edit-listing/:id');
    expect(ROUTES.PROVIDER_PROFILE).toBe('/provider/profile');
    expect(ROUTES.PROVIDER_PROFILE_ID).toBe('/provider/profile/:id');
  });

  test('contains admin routes', () => {
  expect(ROUTES.ADMIN_DASHBOARD).toBe('/admin');
    expect(ROUTES.ADMIN_USERS).toBe('/admin/users');
    expect(ROUTES.ADMIN_PROVIDERS).toBe('/admin/providers');
    expect(ROUTES.ADMIN_LISTINGS).toBe('/admin/listings');
    expect(ROUTES.ADMIN_BOOKINGS).toBe('/admin/bookings');
  });

  test('ROUTES object is not empty', () => {
    expect(Object.keys(ROUTES).length).toBeGreaterThan(0);
  });
});

