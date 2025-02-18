import React from 'react';
import Link from 'next/link';
import { Container } from '../common/Container';  
const LogInNavbar = () => {
  return (
    <Container>
    <div className="navbar bg-white fixed top-0 left-28 right-0 z-50">
      <Link href="/">
        <span className="btn btn-ghost text-xl px-0 hover:bg-white">LAKABE</span>
      </Link>
    </div>
    </Container>
  );
};

export default LogInNavbar;
