import React, { useEffect, useRef, useState } from 'react';

interface SequentialFadeSlideUpProps {
  children: React.ReactNode[];
  fadeInDuration: number;
  delay: number;
  once: boolean;
  rootMargin?: string;
}

const SequentialFadeSlideUp: React.FC<SequentialFadeSlideUpProps> = ({ children, fadeInDuration, delay, once, rootMargin = '0px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        }
      },
      {
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [once, rootMargin]);

  return (
    <div ref={ref} className="flex flex-col sm:flex-row items-center justify-center gap-24">
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            transition: `opacity ${fadeInDuration}s ease-in-out ${delay * index}s, transform ${fadeInDuration}s ease-in-out ${delay * index}s`,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default SequentialFadeSlideUp;