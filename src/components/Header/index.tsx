import React from 'react';
import { Link } from 'react-router-dom';

type HeaderType = {
  title: string,
  links: Array<{ href: string, text: string }>
};

const Header = ({ title, links }: HeaderType) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      <nav className="nav nav-bar">
        {links.map((link, i) => <Link key={i} to={link.href} >{link.text}</Link>)}
      </nav>
    </header>
  );
}

export default Header;