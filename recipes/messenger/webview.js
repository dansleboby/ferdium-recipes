function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const _path = _interopRequireDefault(require('path'));

function hideInstallMessage() {
  // Obfuscated Meta class; recheck if banner returns.
  const installMessage = document.querySelector('.usczdcwk');
  if (installMessage && installMessage.style.display !== 'none') {
    installMessage.style.display = 'none';
  }
}

module.exports = (Ferdium, settings) => {
  // Unread threads render the name in bold. Read font-weight instead of
  // obfuscated classes or localized text -> robust and language-agnostic.
  const isBold = el => {
    const w = Number.parseInt(window.getComputedStyle(el).fontWeight, 10);
    return Number.isFinite(w) && w >= 600;
  };

  const rowIsUnread = anchor => {
    // First non-empty text span = the conversation name.
    const name = [...anchor.querySelectorAll('span[dir="auto"]')].find(
      el => el.textContent.trim() !== '',
    );
    if (!name) return false;
    return isBold(name) || isBold(name.firstElementChild || name);
  };

  const getMessages = () => {
    // Thread list is the only role="grid". Count thread links only.
    const grid = document.querySelector('[role="grid"]');
    if (!grid) {
      Ferdium.setBadge(0);
      return;
    }

    let count = 0;
    for (const row of grid.querySelectorAll('a[href*="/t/"][role="link"]')) {
      if (rowIsUnread(row)) count += 1;
    }

    // List is virtualized: only visible rows are counted.
    Ferdium.setBadge(count);
  };

  const loopRoutine = () => {
    getMessages();
    hideInstallMessage();
  };

  Ferdium.loop(loopRoutine);
  Ferdium.injectCSS(_path.default.join(__dirname, 'service.css'));

  localStorage.setItem(
    '_cs_desktopNotifsEnabled',
    JSON.stringify({
      __t: Date.now(),
      __v: true,
    }),
  );

  if (typeof Ferdium.onNotify === 'function') {
    Ferdium.onNotify(notification => {
      if (typeof notification.title !== 'string') {
        notification.title =
          ((notification.title.props || {}).content || [])[0] || 'Messenger';
      }
      if (typeof notification.options.body !== 'string') {
        notification.options.body =
          (((notification.options.body || {}).props || {}).content || [])[0] ||
          '';
      }
      return notification;
    });
  }

  document.addEventListener(
    'click',
    event => {
      const link = event.target.closest('a[href^="http"]');
      const button = event.target.closest('button[title^="http"]');
      if (link || button) {
        const url = link
          ? link.getAttribute('href')
          : button.getAttribute('title');
        event.preventDefault();
        event.stopPropagation();
        if (url.includes('fbsbx.com') || settings.trapLinkClicks === true) {
          window.location.href = url;
        } else {
          Ferdium.openNewWindow(url);
        }
      }
    },
    true,
  );
};
