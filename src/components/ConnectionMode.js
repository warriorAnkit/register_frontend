import { useEffect } from 'react';
import { messageContext } from './AppContextHolder';

export default function ConnectionMode() {
  useEffect(() => {
    const handleStatusChange = () => {
      // eslint-disable-next-line no-undef
      const status = navigator?.onLine;
      if (!status) {
        messageContext?.info(
          "You're offline. Please check your internet connection.",
        );
      } else {
        messageContext?.success("We're back online.");
      }
    };

    // eslint-disable-next-line no-undef
    window.addEventListener('online', handleStatusChange);
    // eslint-disable-next-line no-undef
    window.addEventListener('offline', handleStatusChange);

    return () => {
      // eslint-disable-next-line no-undef
      window.removeEventListener('online', handleStatusChange);
      // eslint-disable-next-line no-undef
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);
  return null;
}
