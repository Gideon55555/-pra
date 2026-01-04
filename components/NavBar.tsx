'use client';

import Link from 'next/link'
import Image from 'next/image'
import posthog from 'posthog-js'

const NavBar = () => {
  const handleLogoClick = () => {
    posthog.capture('logo_clicked', {
      source: 'navbar',
    });
  };

  const handleNavHomeClick = () => {
    posthog.capture('nav_home_clicked', {
      source: 'navbar',
    });
  };

  const handleNavEventsClick = () => {
    posthog.capture('nav_events_clicked', {
      source: 'navbar',
    });
  };

  const handleNavCreateEventsClick = () => {
    posthog.capture('nav_create_events_clicked', {
      source: 'navbar',
    });
  };

  return (
    <header>
        <nav>
            <Link href="/" className="logo" onClick={handleLogoClick}>
                <Image
                    src="/icons/logo.png"
                    alt="logo"
                    width={24}
                    height={24}
                />
             <p>DevEvents</p>
            </Link>

            <ul>
                <Link href="/" onClick={handleNavHomeClick}>Home</Link>
                <Link href="/" onClick={handleNavEventsClick}>Events</Link>
                <Link href="/" onClick={handleNavCreateEventsClick}>Create Events</Link>
            </ul>

        </nav>
    </header>
  )
}

export default NavBar
