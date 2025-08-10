'use client';

let isLoggedIn = false;

export function login(username: string, password: string) {
  if (username === 'admin' && password === 'admin') {
    isLoggedIn = true;
    return true;
  }
  return false;
}

export function logout() {
  isLoggedIn = false;
}

export function checkAuth() {
  return isLoggedIn;
}
