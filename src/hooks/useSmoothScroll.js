import { useEffect } from 'react';

function useSmoothScroll() {
  useEffect(() => {
    const handleScroll = (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      event.preventDefault();
      const targetId = link.getAttribute('href');
      try {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start', // Or 'center' depending on preference
          });
          // Optionally close mobile menu here if needed (pass menu state/setter down or use context)
        } else {
            console.warn(`Smooth scroll target not found: ${targetId}`);
        }
      } catch (error) {
        console.error(`Error finding element for smooth scroll: ${targetId}`, error);
      }
    };

    document.addEventListener('click', handleScroll);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount
}

export default useSmoothScroll;