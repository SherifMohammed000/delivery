// Firebase Messaging Service Worker
// This file MUST be at the root of public/ for FCM to work
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAwjkKw2mNm9ToL0gOPdguvagvETPZxHK8",
  authDomain: "delivery-65c7f.firebaseapp.com",
  projectId: "delivery-65c7f",
  storageBucket: "delivery-65c7f.firebasestorage.app",
  messagingSenderId: "1018540716688",
  appId: "1:1018540716688:web:b5ea6717a2dc26e493de15",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'GHo-VA', {
    body: body || 'You have a new update.',
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      { action: 'open', title: 'View Order' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const url = '/orders';
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});
